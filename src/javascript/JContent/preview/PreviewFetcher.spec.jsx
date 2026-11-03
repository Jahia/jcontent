import React from 'react';
import {mount} from 'enzyme';
import {PreviewFetcher} from './PreviewFetcher';
import {useContentPreview} from './useContentPreview';

jest.mock('./useContentPreview', () => ({useContentPreview: jest.fn()}));
jest.mock('~/ContentEditor/DesignSystem/LoaderOverlay', () => ({
    LoaderOverlay: () => <div data-testid="loader"/>
}));
jest.mock('./viewers', () => {
    const PropTypes = jest.requireActual('prop-types');
    const PreviewViewers = ({pageCssHtml}) => <div data-testid="viewers" data-css={pageCssHtml}/>;
    PreviewViewers.propTypes = {pageCssHtml: PropTypes.string};
    return {PreviewViewers};
});
jest.mock('./viewers/NoView', () => ({NoView: () => <div data-testid="no-view"/>}));

const preview = {data: {jcr: {nodeByPath: {renderedContent: {output: '<p>form</p>'}}}}, loading: false, refetch: jest.fn()};
const cssLoading = {data: undefined, loading: true};
const cssLoaded = {data: {jcr: {nodeByPath: {renderedContent: {output: '<head><link rel="stylesheet" href="/site.css"></head>'}}}}, loading: false};

const renderFetcher = (previewContext, cssResult) => {
    useContentPreview.mockImplementation(({skip, contextConfiguration}) => {
        if (contextConfiguration === 'page') {
            return skip ? {loading: false} : cssResult;
        }

        return preview;
    });
    return mount(<PreviewFetcher previewContext={{path: '/sites/site/contents/form', workspace: 'EDIT', language: 'en', contextConfiguration: 'module', ...previewContext}} onContentNotFound={jest.fn()}/>);
};

describe('PreviewFetcher', () => {
    it('waits for the page a content lives in before it shows the preview', () => {
        const cmp = renderFetcher({cssSourcePath: '/sites/site/home'}, cssLoading);
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(true);
        expect(cmp.find('[data-testid="viewers"]').exists()).toBe(false);
    });

    it('shows a content with no page before its content-template render returns', () => {
        const cmp = renderFetcher({cssSourcePath: '/sites/site/contents/form', cssSourceView: 'content-template'}, cssLoading);
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(false);
        expect(cmp.find('[data-testid="viewers"]').prop('data-css')).toBe('');
    });

    it('takes the stylesheets of the content-template render once it returns', () => {
        const cmp = renderFetcher({cssSourcePath: '/sites/site/contents/form', cssSourceView: 'content-template'}, cssLoaded);
        expect(cmp.find('[data-testid="viewers"]').prop('data-css')).toContain('/site.css');
    });
});
