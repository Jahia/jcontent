import React from 'react';
import {shallow} from 'enzyme';
import {Preview} from './Preview';

jest.mock('./PreviewFetcher', () => ({
    PreviewFetcher: () => <div data-testid="fetcher"/>
}));

const baseContext = {
    path: '/site/digitall',
    workspace: 'edit',
    language: 'en',
    templateType: 'html',
    contextConfiguration: 'page'
};

const renderPreview = (props = {}) => shallow(
    <Preview
        previewContext={baseContext}
        onContentNotFound={jest.fn()}
        {...props}
    />
);

describe('Preview', () => {
    it('renders Edit and Live buttons', () => {
        const cmp = renderPreview();
        expect(cmp.find('[data-sel-role="edit-preview-button"]').exists()).toBe(true);
        expect(cmp.find('[data-sel-role="live-preview-button"]').exists()).toBe(true);
    });

    it('disables Edit button when isEditDisabled', () => {
        const cmp = renderPreview({isEditDisabled: true});
        expect(cmp.find('[data-sel-role="edit-preview-button"]').prop('isDisabled')).toBe(true);
    });

    it('disables Live button when isLiveDisabled', () => {
        const cmp = renderPreview({isLiveDisabled: true});
        expect(cmp.find('[data-sel-role="live-preview-button"]').prop('isDisabled')).toBe(true);
    });

    it('Edit button is disabled when workspace is already edit', () => {
        const cmp = renderPreview();
        expect(cmp.find('[data-sel-role="edit-preview-button"]').prop('isDisabled')).toBe(true);
    });

    it('Live button is disabled when workspace is already live', () => {
        const cmp = renderPreview({previewContext: {...baseContext, workspace: 'live'}});
        expect(cmp.find('[data-sel-role="live-preview-button"]').prop('isDisabled')).toBe(true);
    });
});
