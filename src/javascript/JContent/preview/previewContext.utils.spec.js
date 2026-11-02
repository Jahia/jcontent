import {buildPreviewContextsFromNode} from './previewContext.utils';

const PAGE = {path: '/sites/x/home'};

const node = (overrides = {}) => ({
    path: '/sites/x/home/main/section',
    uuid: 'u-1',
    isPage: false,
    pageAncestors: [PAGE],
    displayableNode: {path: '/sites/x/home'},
    ...overrides
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

    /*
     * Marking content for deletion does not delete it - it stays, and stays readable, until the
     * deletion is published or undone - but Jahia's MarkedForDeletionFilter answers such a node in
     * preview mode with nothing at all for anything smaller than a page, which is a blank pane
     * where the content should be. The attribute is what asks the render chain for it anyway.
     */
    const DELETION_ATTRIBUTE = 'previewMarkedForDeletion';
    const markedForDeletion = {mixinTypes: [{name: 'jmix:markedForDeletion'}]};

    it('asks for the content anyway when the node is marked for deletion', () => {
        const {primary} = buildPreviewContextsFromNode(node(markedForDeletion), 'en');

        expect(primary.requestAttributes).toEqual(
            expect.arrayContaining([{name: DELETION_ATTRIBUTE, value: 'true'}])
        );
    });

    // The fallback is a second route to the same pane, so a fallback that came back blank would be
    // the same bug arriving a moment later.
    it('asks for it on the fallback render too', () => {
        const {fallback} = buildPreviewContextsFromNode(node(markedForDeletion), 'en');

        expect(fallback.requestAttributes).toEqual(
            expect.arrayContaining([{name: DELETION_ATTRIBUTE, value: 'true'}])
        );
    });

    it('asks for nothing of the sort for a node that is not marked', () => {
        const {primary} = buildPreviewContextsFromNode(node(), 'en');

        expect(primary.requestAttributes || []).not.toEqual(
            expect.arrayContaining([expect.objectContaining({name: DELETION_ATTRIBUTE})])
        );
    });

    it('takes the NEAREST page when the node is nested several deep', () => {
        const {primary} = buildPreviewContextsFromNode(
            node({pageAncestors: [{path: '/sites/x'}, {path: '/sites/x/home'}, {path: '/sites/x/home/sub'}]}),
            'en'
        );

        expect(primary.path).toBe('/sites/x/home/sub');
    });
});
