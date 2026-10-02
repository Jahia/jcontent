import {buildPreviewContexts, buildPreviewContextsFromNode, buildSamplePreviewContext} from './previewContext.utils';

const PAGE = {path: '/sites/x/home'};

const node = (overrides = {}) => ({
    path: '/sites/x/home/main/section',
    uuid: 'u-1',
    isPage: false,
    pageAncestors: [PAGE],
    displayableNode: {path: '/sites/x/home'},
    ...overrides
});

describe('buildPreviewContexts', () => {
    const language = 'en';

    it('previews a page as a full page render, without a CSS source', () => {
        const page = {path: '/sites/site/home', uuid: 'p', isPage: true, displayableNode: {path: '/sites/site/home'}};
        const {primary} = buildPreviewContexts(page, language);
        expect(primary.contextConfiguration).toBe('page');
        expect(primary.cssSourcePath).toBeUndefined();
    });

    it('previews a displayable content as a full page render through its own template, without a CSS source', () => {
        const content = {path: '/sites/site/contents/news', uuid: 'n', isPage: false, displayableNode: {path: '/sites/site/contents/news', isFolder: false}};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.contextConfiguration).toBe('page');
        expect(primary.cssSourcePath).toBeUndefined();
        expect(primary.cssSourceView).toBeUndefined();
    });

    it('takes the CSS of a content living in a page from that page', () => {
        const content = {path: '/sites/site/home/area/text', uuid: 't', isPage: false, displayableNode: {path: '/sites/site/home', isFolder: false}};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.cssSourcePath).toBe('/sites/site/home');
        expect(primary.cssSourceView).toBeUndefined();
    });

    it('renders a content with no page of its own through the content-template wrapper for its CSS', () => {
        const content = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, isContent: true, displayableNode: null};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.view).toBeNull();
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
    });

    it('does the same when the displayable node is a folder', () => {
        const content = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, isContent: true, displayableNode: {path: '/sites/site/contents', isFolder: true}};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
    });

    // The content-template wrapper applies to jnt:content only: a render of anything else fails
    it('takes no CSS source for a file, a folder or a category, which the wrapper cannot render', () => {
        const file = {path: '/sites/site/files/logo.png', uuid: 'l', isPage: false, isContent: false, displayableNode: null};
        const {primary} = buildPreviewContexts(file, language);
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.cssSourcePath).toBeUndefined();
        expect(primary.cssSourceView).toBeUndefined();
    });

    it('leaves the in-context strategies untouched', () => {
        const content = {path: '/sites/site/home/area/text', uuid: 't', isPage: false, displayableNode: {path: '/sites/site/home', isFolder: false}};
        const {primary, fallback} = buildPreviewContexts(content, language, {closestPage: {path: '/sites/site/home'}});
        expect(primary.contextConfiguration).toBe('page');
        expect(fallback.cssSourcePath).toBe('/sites/site/home');
        expect(fallback.cssSourceView).toBeUndefined();
    });
});

describe('buildPreviewContextsFromNode', () => {
    it('renders a node nested in a page in the context of that page', () => {
        const {primary} = buildPreviewContextsFromNode(node(), 'en');

        expect(primary.contextConfiguration).toBe('page');
        expect(primary.path).toBe(PAGE.path);
    });

    /*
     * The reason the accordion is not part of this decision. A module contributing its own
     * accordion lists the same nodes the page tree does, and they are nested in a page just the
     * same - gating on the accordion rendered them standalone, which for content that cannot
     * stand alone is markup with no page around it and none of its CSS.
     */
    it('does so whatever accordion a caller still passes', () => {
        // The accordion used to decide this, so callers pass one. An argument that no longer takes
        // part must not quietly bring the old behaviour back for them.
        const plain = buildPreviewContextsFromNode(node(), 'en');
        const withStaleAccordion = buildPreviewContextsFromNode(node(), 'en', 'content-folders');

        expect(withStaleAccordion.primary).toEqual(plain.primary);
        expect(withStaleAccordion.primary.contextConfiguration).toBe('page');
    });

    // A page is already a page: it renders as itself, not anchored to an ancestor page.
    it('renders a page as itself rather than inside its parent', () => {
        const parent = {path: '/sites/x'};
        const {primary} = buildPreviewContextsFromNode(
            node({isPage: true, path: PAGE.path, pageAncestors: [parent], displayableNode: {path: PAGE.path}}),
            'en'
        );

        expect(primary.contextConfiguration).toBe('page');
        expect(primary.path).toBe(PAGE.path);
        expect(primary.path).not.toBe(parent.path);
    });

    /*
     * Content folders, media and categories all land here: nothing to anchor a page render to.
     *
     * Out of context splits in two, on whether the node is its own displayableNode - that is what
     * says core resolved a template for it. Both are asserted, because the accordion no longer
     * takes part in this decision and these are the two answers that remain.
     */
    it('renders the view out of context when there is no page ancestor and no template of its own', () => {
        const {primary} = buildPreviewContextsFromNode(
            node({path: '/sites/x/contents/item', pageAncestors: [], displayableNode: {path: '/sites/x/contents'}}),
            'en'
        );

        expect(primary.contextConfiguration).toBe('module');
    });

    it('renders a node that is its own displayableNode as a full page, so its template applies', () => {
        const {primary} = buildPreviewContextsFromNode(
            node({path: '/sites/x/contents/item', pageAncestors: [], displayableNode: {path: '/sites/x/contents/item'}}),
            'en'
        );

        expect(primary.contextConfiguration).toBe('page');
        expect(primary.path).toBe('/sites/x/contents/item');
    });

    it('takes the NEAREST page when the node is nested several deep', () => {
        const {primary} = buildPreviewContextsFromNode(
            node({pageAncestors: [{path: '/sites/x'}, {path: '/sites/x/home'}, {path: '/sites/x/home/sub'}]}),
            'en'
        );

        expect(primary.path).toBe('/sites/x/home/sub');
    });
});

describe('buildSamplePreviewContext', () => {
    const PREVIEW_PAGE = '/sites/luxe/home';
    const sample = {
        path: '/sites/luxe/samples/components/page-header',
        uuid: 'sample-uuid',
        jView: {value: 'default'}
    };

    it('should render the sample as a module dressed in the preview page CSS', () => {
        const context = buildSamplePreviewContext(sample, 'en', PREVIEW_PAGE);

        expect(context.path).toBe(sample.path);
        expect(context.contextConfiguration).toBe('module');
        // A module render collects no CSS of its own, so it is taken from a page rendered alongside.
        expect(context.cssSourcePath).toBe(PREVIEW_PAGE);
        // Passed as main resource too, for components that read the current page.
        expect(context.mainResourcePath).toBe(PREVIEW_PAGE);
        expect(context.workspace).toBe('edit');
        expect(context.language).toBe('en');
    });

    it('should not depend on where the sample is stored', () => {
        // Samples are kept flat, with no page around them - a module render needs no displayable
        // ancestor, which is the whole reason the structure could be flattened.
        const flat = {...sample, path: '/sites/luxe/samples/components/x', displayableNode: null};
        expect(buildSamplePreviewContext(flat, 'en', PREVIEW_PAGE).path).toBe('/sites/luxe/samples/components/x');
    });

    it('should honour an explicit view on the sample', () => {
        expect(buildSamplePreviewContext({...sample, jView: {value: 'teaser'}}, 'en', PREVIEW_PAGE).view).toBe('teaser');
    });

    it('should fall back to the default view', () => {
        expect(buildSamplePreviewContext({...sample, jView: undefined}, 'en', PREVIEW_PAGE).view).toBe('default');
    });

    it('should return null when there is no page to borrow CSS from', () => {
        expect(buildSamplePreviewContext(sample, 'en', undefined)).toBeNull();
        expect(buildSamplePreviewContext(undefined, 'en', PREVIEW_PAGE)).toBeNull();
    });
});
