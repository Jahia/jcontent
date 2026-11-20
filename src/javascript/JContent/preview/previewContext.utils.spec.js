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

    describe('the cm view (jcontent#2883)', () => {
        const mainResource = (overrides = {}) => ({path: '/sites/site/contents/news', uuid: 'n', isPage: false, displayableNode: {path: '/sites/site/contents/news', isFolder: false}, ...overrides});

        it('renders a content with a content template and a cm view through the server-picked view, with the template render as CSS', () => {
            const {primary} = buildPreviewContexts(mainResource({hasCmView: true}), language);
            expect(primary.contextConfiguration).toBe('module');
            expect(primary.view).toBeNull();
            expect(primary.cssSourcePath).toBe('/sites/site/contents/news');
            // Set, so PreviewFetcher does not hold the preview until the template render arrives.
            expect(primary.cssSourceView).toBe('default');
        });

        it('keeps the content template render when there is no cm view', () => {
            const {primary} = buildPreviewContexts(mainResource({hasCmView: false}), language);
            expect(primary.contextConfiguration).toBe('page');
            expect(primary.view).toBe('default');
        });

        it('keeps the content template render when the node has a j:view, as the server picks j:view before cm', () => {
            const {primary} = buildPreviewContexts(mainResource({hasCmView: true, jView: {value: 'event'}}), language);
            expect(primary.contextConfiguration).toBe('page');
            expect(primary.view).toBe('default');
        });

        it('never renders a page through its cm view', () => {
            const page = {path: '/sites/site/home', uuid: 'p', isPage: true, hasCmView: true, displayableNode: {path: '/sites/site/home'}};
            const {primary} = buildPreviewContexts(page, language);
            expect(primary.contextConfiguration).toBe('page');
        });

        it('lets the server pick the view of a main resource rendered in its page', () => {
            const content = mainResource({path: '/sites/site/home/news', displayableNode: {path: '/sites/site/home/news', isFolder: false}, jView: {value: 'event'}});
            const {primary} = buildPreviewContexts(content, language, {closestPage: {path: '/sites/site/home'}});
            expect(primary.contextConfiguration).toBe('module');
            expect(primary.view).toBeNull();
            expect(primary.cssSourcePath).toBe('/sites/site/home');
        });
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
