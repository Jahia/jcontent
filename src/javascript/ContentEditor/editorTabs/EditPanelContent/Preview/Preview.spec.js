import React from 'react';
import {shallow} from 'enzyme';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {useSidePanelContext} from '~/JContent/SidePanel';

jest.mock('~/JContent/SidePanel/SidePanelContext');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(() => undefined)
}));
jest.mock('~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches', () => ({
    setPreviewRefetcher: jest.fn(),
    invalidateRefetch: jest.fn()
}));
jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({pagecomposer: {currentPage: null, active: false}}))
}));
jest.mock('./Preview.utils', () => ({
    getPreviewPath: jest.fn(() => '/site/digitall')
}));
jest.mock('~/JContent/preview/previewContext.utils', () => ({
    buildPreviewContexts: jest.fn(() => ({
        primary: {
            workspace: 'edit',
            path: '/site/digitall',
            contextConfiguration: 'module',
            requestAttributes: []
        },
        fallback: null
    }))
}));
jest.mock('~/JContent/ContentRoute/ContentLayout/PreviewDrawer/Preview/EmptyListComponent/EmptyListComponent', () => ({
    useEmptyListComponent: jest.fn(() => ({loading: false, component: null}))
}));
jest.mock('~/JContent/preview/viewers/PDFViewer', () => ({PDFViewer: () => null}));
jest.mock('~/JContent/preview/viewers/PDFViewer/index.js', () => ({PDFViewer: () => null}));
jest.mock('./useUnsavedValues', () => ({
    useUnsavedValues: jest.fn(() => ({isSupported: false, unsavedValues: null}))
}));
jest.mock('~/JContent/preview/Preview', () => ({
    // eslint-disable-next-line react/prop-types
    Preview: ({header, ...rest}) => <div data-testid="shared-preview" {...rest}>{header}</div>
}));

import {CEPreview} from './CEPreview';
import {useUnsavedValues} from './useUnsavedValues';
import {buildPreviewContexts} from '~/JContent/preview/previewContext.utils';
import {act} from 'react-dom/test-utils';

// Helper: shallow-render a React element returned as a prop
const renderProp = element => shallow(<div>{element}</div>);

describe('CE Preview', () => {
    let editorContext;

    beforeEach(() => {
        editorContext = {
            path: '/site/digitall',
            lang: 'fr',
            nodeData: {
                isFolder: false,
                uuid: 'test-uuid'
            }
        };
        useSidePanelContext.mockReturnValue(editorContext);
        useUnsavedValues.mockReturnValue({isSupported: false, unsavedValues: null});
    });

    it('renders SharedPreview', () => {
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').exists()).toBe(true);
    });

    it('includes UpdateOnSaveBadge in header', () => {
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('UpdateOnSaveBadge').exists()).toBe(true);
    });

    it('shows the unsaved values in the preview when the server supports them', () => {
        const unsavedValues = {node: 'test-uuid', properties: [{name: 'text', value: 'typed', language: 'fr'}]};
        useUnsavedValues.mockReturnValueOnce({isSupported: true, unsavedValues});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('previewContext').unsavedValues).toBe(unsavedValues);
        const header = renderProp(cmp.find('Preview').prop('header'));
        expect(header.find('UpdateOnSaveBadge').exists()).toBe(false);
    });

    it('sends the unsaved values to the fallback render of a content on a page too', () => {
        const unsavedValues = {node: 'test-uuid', properties: [{name: 'text', value: 'typed', language: 'fr'}]};
        buildPreviewContexts.mockReturnValueOnce({
            primary: {workspace: 'edit', path: '/site/digitall/page', contextConfiguration: 'page', requestAttributes: []},
            fallback: {workspace: 'edit', path: '/site/digitall', contextConfiguration: 'module', requestAttributes: []}
        });
        useUnsavedValues.mockReturnValue({isSupported: true, unsavedValues});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('previewContext').unsavedValues).toBe(unsavedValues);
        expect(cmp.find('Preview').prop('fallbackPreviewContext').unsavedValues).toBe(unsavedValues);
    });

    it('keeps the same preview context while the form renders with the same values', () => {
        const unsavedValues = {node: 'test-uuid', properties: [{name: 'text', value: 'typed', language: 'fr'}]};
        useUnsavedValues.mockReturnValue({isSupported: true, unsavedValues});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const first = cmp.find('Preview').prop('previewContext');
        cmp.setProps({});
        expect(cmp.find('Preview').prop('previewContext')).toBe(first);

        const retyped = {node: 'test-uuid', properties: [{name: 'text', value: 'typed again', language: 'fr'}]};
        useUnsavedValues.mockReturnValue({isSupported: true, unsavedValues: retyped});
        cmp.setProps({});
        expect(cmp.find('Preview').prop('previewContext')).not.toBe(first);
        expect(cmp.find('Preview').prop('previewContext').unsavedValues).toBe(retyped);
    });

    it('shows the update-on-save badge for a change that the preview cannot show', () => {
        useUnsavedValues.mockReturnValueOnce({isSupported: true, unsavedValues: null, isPartial: true});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const header = renderProp(cmp.find('Preview').prop('header'));
        expect(header.find('UpdateOnSaveBadge').exists()).toBe(true);
    });

    it('shows the update-on-save badge while the server refuses the unsaved values', () => {
        const unsavedValues = {node: 'test-uuid', properties: [{name: 'text', value: '12a', language: 'fr'}]};
        useUnsavedValues.mockReturnValue({isSupported: true, unsavedValues, isPartial: false});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        expect(renderProp(cmp.find('Preview').prop('header')).find('UpdateOnSaveBadge').exists()).toBe(false);

        act(() => {
            cmp.find('Preview').prop('onUnsavedValuesRefused')(true);
        });
        cmp.update();
        expect(renderProp(cmp.find('Preview').prop('header')).find('UpdateOnSaveBadge').exists()).toBe(true);

        useUnsavedValues.mockReturnValue({isSupported: true, unsavedValues: null, isPartial: false});
        cmp.setProps({});
        // No badge without unsaved values.
        expect(renderProp(cmp.find('Preview').prop('header')).find('UpdateOnSaveBadge').exists()).toBe(false);
    });

    it('shows no-preview badge in header for folder nodes', () => {
        editorContext.nodeData.isFolder = true;
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('DsBadge').exists()).toBe(true);
    });

    it('does not show no-preview badge for non-folder nodes', () => {
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('DsBadge').exists()).toBe(false);
    });
});
