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

    it('shows the update-on-save badge for a change that the preview cannot show', () => {
        useUnsavedValues.mockReturnValueOnce({isSupported: true, unsavedValues: null, isPartial: true});
        const cmp = shallowWithTheme(<CEPreview/>, {}, dsGenericTheme);
        const header = renderProp(cmp.find('Preview').prop('header'));
        expect(header.find('UpdateOnSaveBadge').exists()).toBe(true);
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
