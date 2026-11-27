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

const base = {path: '/sites/site/contents/form', workspace: 'EDIT', language: 'en', contextConfiguration: 'module'};

/** A fetcher, with unsaved values unless hasUnsavedValues is false, whose next result the test sets render after render. */
const renderSequence = (hasUnsavedValues = true) => {
    let result = preview;
    useContentPreview.mockImplementation(({contextConfiguration}) => (contextConfiguration === 'page' ? {loading: false} : result));
    const onUnsavedValuesRefused = jest.fn();
    // A new context object at each render, as the preview of a form builds one at each change.
    const contextOf = () => (hasUnsavedValues ? {...base, unsavedValues: {node: 'node-uuid', properties: []}} : {...base});
    const cmp = mount(<PreviewFetcher previewContext={contextOf()} onContentNotFound={jest.fn()} onUnsavedValuesRefused={onUnsavedValuesRefused}/>);
    return {
        cmp,
        onUnsavedValuesRefused,
        next: (nextResult, contextChange = {}) => {
            result = {refetch: jest.fn(), ...nextResult};
            cmp.setProps({previewContext: {...contextOf(), ...contextChange}});
            cmp.update();
        }
    };
};

const output = cmp => cmp.find('[data-testid="viewers"]').prop('data-output');
// The server refuses unsaved values with a GraphQL error, which Apollo puts in graphQLErrors.
const refusal = message => Object.assign(new Error(message), {graphQLErrors: [{message}]});
const refused = {loading: false, error: refusal('refused'), data: {jcr: null}};
// A render error under errorPolicy 'all' keeps the node with no render, so only the error keeps it out of the kept render.
const refusedRender = {loading: false, error: refusal('render failed'), data: {jcr: {nodeByPath: {renderedContent: null}}}};
const other = {data: {jcr: {nodeByPath: {renderedContent: {output: '<p>other</p>'}}}}, loading: false};

describe('PreviewFetcher', () => {
    let log;
    beforeEach(() => {
        log = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        log.mockRestore();
    });

    it('keeps the last render on screen while the render of new unsaved values loads', () => {
        const {cmp, next} = renderSequence();
        next({loading: true});
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(false);
        expect(output(cmp)).toBe('<p>form</p>');
    });

    it('keeps the last render with no error through two refusals in a row, and logs each refusal once', () => {
        const {cmp, next, onUnsavedValuesRefused} = renderSequence();
        next(refused);
        expect(log).toHaveBeenCalledWith('Error while fetching preview', refused.error);
        expect(cmp.find('[data-testid="no-view"]').exists()).toBe(false);
        expect(output(cmp)).toBe('<p>form</p>');
        expect(onUnsavedValuesRefused).toHaveBeenLastCalledWith(true);

        next({loading: true, data: undefined});
        expect(output(cmp)).toBe('<p>form</p>');
        // A render that loads keeps the last answer.
        expect(onUnsavedValuesRefused).toHaveBeenLastCalledWith(true);
        next(refusedRender);
        expect(output(cmp)).toBe('<p>form</p>');
        expect(log).toHaveBeenLastCalledWith('Error while fetching preview', refusedRender.error);
        next(refusedRender);
        // React logs its own warnings through console.error too, so only the lines of the preview count.
        expect(log.mock.calls.filter(([message]) => message === 'Error while fetching preview')).toHaveLength(2);
    });

    it('shows no view for a network error, which is no refusal of the values, and logs it', () => {
        const {cmp, next, onUnsavedValuesRefused} = renderSequence();
        const networkError = Object.assign(new Error('Failed to fetch'), {graphQLErrors: [], networkError: new Error('offline')});
        next({loading: false, error: networkError, data: undefined});
        expect(cmp.find('[data-testid="no-view"]').exists()).toBe(true);
        expect(onUnsavedValuesRefused).toHaveBeenLastCalledWith(false);
        expect(log).toHaveBeenCalledWith('Error while fetching preview', networkError);
    });

    it('keeps no render of another language, which the editor switched to', () => {
        const {cmp, next} = renderSequence();
        next({loading: true}, {language: 'fr'});
        expect(cmp.find('[data-testid="loader"]').exists()).toBe(true);
        next(refused, {language: 'fr'});
        expect(cmp.find('[data-testid="no-view"]').exists()).toBe(true);
        expect(cmp.find('[data-testid="viewers"]').exists()).toBe(false);
    });

    it.each([
        ['view', {view: 'cm'}],
        ['path', {path: '/sites/site/contents/other'}],
        ['context configuration', {contextConfiguration: 'preview'}]
    ])('keeps no render of another %s', (_, contextChange) => {
        const {cmp, next} = renderSequence();
        next(refused, contextChange);
        expect(cmp.find('[data-testid="no-view"]').exists()).toBe(true);
        expect(cmp.find('[data-testid="viewers"]').exists()).toBe(false);
    });

    it('shows the next render with no error, and reports that the server accepts the values again', () => {
        const {cmp, next, onUnsavedValuesRefused} = renderSequence();
        next(refused);
        next(other);
        expect(output(cmp)).toBe('<p>other</p>');
        expect(onUnsavedValuesRefused).toHaveBeenLastCalledWith(false);
    });

    it('shows the loader, not the last render, while a render without unsaved values loads', () => {
        const {cmp, next} = renderSequence(false);
        expect(output(cmp)).toBe('<p>form</p>');
        next({loading: true});
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
