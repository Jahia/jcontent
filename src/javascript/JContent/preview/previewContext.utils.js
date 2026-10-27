import JContentConstants from '~/JContent/JContent.constants';

/**
 * Shared helper for in-context module render with page CSS injection.
 * Used for both the main-resource in-context strategy and as the sub-component fallback.
 */
const buildInContextModuleContext = (node, closestPage, jView, base) => ({
    ...base,
    path: node.path,
    view: jView?.value || 'default',
    contextConfiguration: 'module',
    mainResourcePath: closestPage.path,
    cssSourcePath: closestPage.path
});

/**
 * The page whose head gives an out-of-context module render its CSS: the displayable ancestor if it is a non-folder
 * page. A content with no page at all (a form in a content folder) is rendered through the content-template wrapper
 * instead: that is the document its preview URL uses, and where the site loads its stylesheets for such content.
 */
const getOutOfContextCssSource = (node, isDisplayablePage) => {
    if (isDisplayablePage) {
        return {cssSourcePath: node.displayableNode.path};
    }

    return {cssSourcePath: node.path, cssSourceView: JContentConstants.contentTemplate};
};

/**
 * Core preview context builder. Returns { primary, fallback }.
 *
 * Rendering strategies:
 *
 * A. In-context (closestPage provided):
 *    - isDisplayableNode: module render of node + page CSS. No zoom (avoids pagination problem).
 *    - !isDisplayableNode: full page render at closestPage + zoom requestAttributes.
 *      fallback = module+CSS strategy (used if zoom fails).
 *
 * B. Out-of-context (no closestPage):
 *    - isDisplayableNode: full 'page' render of the node itself. `displayableNode === node`
 *      means core resolved a template for it — a page template for a page, a content template
 *      for content carrying jmix:mainResource. That template is only applied under the 'page'
 *      configuration (templateNodeFilter applies on wrappedcontent,page,gwt), so any other
 *      configuration renders the bare view instead of the content template. The template
 *      output is a full document, so it carries its own CSS.
 *    - !isDisplayableNode: module render of the view. CSS injected via cssSourcePath, taken
 *      from the displayable ancestor when it is a non-folder page, else from the node itself
 *      rendered through the content-template wrapper (cssSourceView), the page every standalone
 *      content is previewed in.
 *
 * @param {object} node                 - JCR node with { path, uuid, isPage, displayableNode, jView }
 * @param {string} language
 * @param {object} options
 * @param {object} [options.closestPage]        - { path, view? } — the hosting page context.
 *   JContent: pageAncestors.at(-1), whatever accordion is open. CE: pageComposerCurrentPage or
 *   displayableNode ancestor.
 * @param {boolean} [options.isCEPreview]  - Attach ce_preview requestAttribute to signal CE preview mode
 *   to other modules. true for CE, false for JContent.
 * @param {Array}   [options.requestParameters] - CE page composer query string params.
 */
export const buildPreviewContexts = (node, language, {closestPage = null, isCEPreview = false, requestParameters = []} = {}) => {
    const {displayableNode, jView} = node;
    const isDisplayableNode = displayableNode?.path === node.path;
    // A folder resolves no template and renders nothing, so it is neither a template holder
    // nor usable as a CSS donor. Both uses below build on this.
    const isDisplayablePage = Boolean(displayableNode) && !displayableNode.isFolder;
    const base = {workspace: 'edit', templateType: 'html', language};
    const extraParams = requestParameters.length > 0 ? {requestParameters} : {};
    const cePreviewAttr = isCEPreview ? [{name: 'ce_preview', value: node.uuid}] : undefined;

    // ClosestPage signals in-context rendering: the node is rendered within a known hosting page.
    // Absent closestPage → out-of-context: the node renders standalone, without a page surround.
    if (closestPage) {
        if (isDisplayableNode) {
            // Main-resource in page context: module render with page CSS.
            return {
                primary: {
                    ...buildInContextModuleContext(node, closestPage, jView, base),
                    ...(cePreviewAttr && {requestAttributes: cePreviewAttr}),
                    ...extraParams
                },
                fallback: null
            };
        }

        // Sub-component/list in page context: full page render + zoom.
        // fallback: module+CSS if zoom fails (#ce_preview_content not found).
        return {
            primary: {
                ...base,
                path: closestPage.path,
                view: closestPage.view || 'default',
                contextConfiguration: 'page',
                requestAttributes: [
                    ...(cePreviewAttr || []),
                    {name: 'preview_wrapper', value: node.path}
                ],
                ...extraParams
            },
            fallback: buildInContextModuleContext(node, closestPage, jView, base)
        };
    }

    // The node has a template of its own — page template, or content template for content
    // holding jmix:mainResource. Render it as a full page so that template is applied; its
    // output already includes the CSS, so no cssSourcePath is needed.
    const hasOwnTemplate = isDisplayableNode && isDisplayablePage;
    if (node.isPage || hasOwnTemplate) {
        return {
            primary: {
                ...base,
                path: node.path,
                // Under the page configuration this argument is the *template* name, not a view
                // name - JCRTemplateResolver nulls it when it equals "default" and otherwise matches
                // it against template node names. The node's own j:view is a view name and would
                // fail resolution, so pass "default" and let core honour j:templateName instead.
                view: 'default',
                contextConfiguration: 'page',
                ...(cePreviewAttr && {requestAttributes: cePreviewAttr}),
                ...extraParams
            },
            fallback: null
        };
    }

    // No template of its own: render the view standalone and inject CSS by fetching a page render.
    return {
        primary: {
            ...base,
            path: node.path,
            view: null,
            contextConfiguration: 'module',
            ...getOutOfContextCssSource(node, isDisplayablePage),
            ...(cePreviewAttr && {requestAttributes: cePreviewAttr}),
            ...extraParams
        },
        fallback: null
    };
};

/**
 * JContent: builds { primary, fallback } from a content table node.
 *
 * Derives closestPage from the node's own page ancestors. Whether a node renders in the context of
 * a page is a fact about the NODE - it is nested in one, or it is not - so it is read from the node
 * rather than from the accordion the reader happens to be browsing in.
 *
 * This used to additionally require the 'pages' accordion. That excluded every accordion a module
 * contributes: a record nested in a page, listed from somewhere other than the page tree, was
 * rendered standalone, which for content that cannot stand alone means markup with no page around
 * it and none of its CSS. It made no difference to jcontent's own accordions, whose nodes - content
 * folders, media, categories - have no page ancestor to find.
 */
export const buildPreviewContextsFromNode = (node, language) => {
    const pageAncestor = node.pageAncestors?.at(-1);
    const closestPage = pageAncestor && !node.isPage ? {path: pageAncestor.path} : null;
    return buildPreviewContexts(node, language, {closestPage});
};
