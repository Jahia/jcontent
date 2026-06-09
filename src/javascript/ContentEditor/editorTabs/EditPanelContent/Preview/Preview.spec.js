import React from 'react';
import {shallow} from 'enzyme';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {usePublicationInfoContext} from '~/ContentEditor/contexts/PublicationInfo';
import JContentConstants from '~/JContent/JContent.constants';

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context');
jest.mock('~/ContentEditor/contexts/ContentEditorConfig/ContentEditorConfig.context');
jest.mock('~/ContentEditor/contexts/ContentEditorSection/ContentEditorSection.context');
jest.mock('~/ContentEditor/contexts/PublicationInfo/PublicationInfo.context');
jest.mock('~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches', () => ({
    setPreviewRefetcher: jest.fn(),
    invalidateRefetch: jest.fn()
}));
jest.mock('./Preview.utils', () => ({
    getPreviewContext: jest.fn(() => ({
        workspace: 'edit',
        path: '/site/digitall',
        contextConfiguration: 'module',
        requestAttributes: []
    }))
}));
jest.mock('~/JContent/preview/Preview', () => ({
    // eslint-disable-next-line react/prop-types
    Preview: ({header, ...rest}) => <div data-testid="shared-preview" {...rest}>{header}</div>
}));

import {Preview} from './Preview';

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
        useContentEditorContext.mockReturnValue(editorContext);
        usePublicationInfoContext.mockReturnValue({
            publicationStatus: JContentConstants.availablePublicationStatuses.PUBLISHED
        });
    });

    it('renders SharedPreview', () => {
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').exists()).toBe(true);
    });

    it('passes showWorkspaceToggle to SharedPreview', () => {
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('showWorkspaceToggle')).toBe(true);
    });

    it('disables live when content is NOT_PUBLISHED', () => {
        usePublicationInfoContext.mockReturnValue({
            publicationStatus: JContentConstants.availablePublicationStatuses.NOT_PUBLISHED
        });
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('isLiveDisabled')).toBe(true);
    });

    it('disables live when content is UNPUBLISHED', () => {
        usePublicationInfoContext.mockReturnValue({
            publicationStatus: JContentConstants.availablePublicationStatuses.UNPUBLISHED
        });
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('isLiveDisabled')).toBe(true);
    });

    it('does not disable live when content is PUBLISHED', () => {
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        expect(cmp.find('Preview').prop('isLiveDisabled')).toBe(false);
    });

    it('includes UpdateOnSaveBadge in header', () => {
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('UpdateOnSaveBadge').exists()).toBe(true);
    });

    it('shows no-preview badge in header for folder nodes', () => {
        editorContext.nodeData.isFolder = true;
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('DsBadge').exists()).toBe(true);
    });

    it('does not show no-preview badge for non-folder nodes', () => {
        const cmp = shallowWithTheme(<Preview/>, {}, dsGenericTheme);
        const headerEl = cmp.find('Preview').prop('header');
        const header = renderProp(headerEl);
        expect(header.find('DsBadge').exists()).toBe(false);
    });
});
