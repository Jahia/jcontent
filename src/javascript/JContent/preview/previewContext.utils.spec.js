import {buildPreviewContexts, buildPreviewContextsFromNode} from './previewContext.utils';

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
        const content = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, displayableNode: null};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.view).toBeNull();
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
    });

    it('does the same when the displayable node is a folder', () => {
        const content = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, displayableNode: {path: '/sites/site/contents', isFolder: true}};
        const {primary} = buildPreviewContexts(content, language);
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
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
