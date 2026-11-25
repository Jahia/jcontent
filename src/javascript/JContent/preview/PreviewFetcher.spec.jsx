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
    const PreviewViewers = ({data, pageCssHtml}) => (
        <div data-testid="viewers" data-css={pageCssHtml} data-output={data.nodeByPath?.renderedContent?.output}/>
    );
    PreviewViewers.propTypes = {data: PropTypes.object, pageCssHtml: PropTypes.string};
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

const renderResult = (previewContext, result) => {
    useContentPreview.mockImplementation(({contextConfiguration}) => (contextConfiguration === 'page' ? {loading: false} : result));
    return mount(<PreviewFetcher previewContext={{path: '/sites/site/contents/form', workspace: 'EDIT', language: 'en', contextConfiguration: 'module', ...previewContext}} onContentNotFound={jest.fn()}/>);
};

describe('PreviewFetcher', () => {
    it('keeps the last render on screen while the render of new unsaved values loads', () => {
        const cmp = renderResult({unsavedValues: {node: 'node-uuid'}}, {loading: true, previousData: preview.data, refetch: jest.fn()});
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(false);
        expect(cmp.find('[data-testid="viewers"]').prop('data-output')).toBe('<p>form</p>');
    });

    it('keeps the last render on screen when the server refuses the unsaved values', () => {
        const cmp = renderResult({unsavedValues: {node: 'node-uuid'}}, {loading: false, error: new Error('refused'), previousData: preview.data, refetch: jest.fn()});
        expect(cmp.find('[data-testid="no-view"]').exists()).toBe(false);
        expect(cmp.find('[data-testid="viewers"]').prop('data-output')).toBe('<p>form</p>');
    });

    it('shows the loader while a render without unsaved values loads', () => {
        const cmp = renderResult({}, {loading: true, previousData: preview.data, refetch: jest.fn()});
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(true);
    });

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
