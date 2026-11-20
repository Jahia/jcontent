/**
 * Shared helper for in-context module render with page CSS injection.
 * Used for both the main-resource in-context strategy and as the sub-component fallback.
 */
const buildInContextModuleContext = (node, closestPage, base) => ({
    ...base,
    path: node.path,
    // Null lets the server pick the view: the node's j:view, else the 'cm' view, else 'default'.
    view: null,
    contextConfiguration: 'module',
    mainResourcePath: closestPage.path,
    cssSourcePath: closestPage.path
});

/**
 * Core preview context builder. Returns { primary, fallback }.
 *
 * Rendering strategies:
 *
 * A. In-context (closestPage provided):
 *    - isDisplayableNode: module render of node + page CSS. No zoom (avoids pagination problem).
 *      view=null: the server renders the node's j:view, else its 'cm' view, else 'default'.
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
 *      Exception: a node with a 'cm' view (hasCmView) and no j:view gets the module render below
 *      instead, as documented for the jContent preview; its content template render gives the CSS.
 *    - !isDisplayableNode: module render of the view. CSS injected via cssSourcePath, taken
 *      from the displayable ancestor when it is a non-folder page.
 *
 * @param {object} node                 - JCR node with { path, uuid, isPage, hasCmView, jView, displayableNode }
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
    const {displayableNode} = node;
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
                    ...buildInContextModuleContext(node, closestPage, base),
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
            fallback: buildInContextModuleContext(node, closestPage, base)
        };
    }

    // The node has a template of its own — page template, or content template for content
    // holding jmix:mainResource. Render it as a full page so that template is applied; its
    // output already includes the CSS, so no cssSourcePath is needed.
    // Render through the node's own template, unless the node has a 'cm' view and no j:view: the
    // server would pick that 'cm' view first. The template render bypasses views, so the server
    // cannot pick 'cm' there: the client decides with hasCmView. A j:view keeps the template.
    const hasOwnTemplate = isDisplayableNode && isDisplayablePage;
    const showsCmView = node.hasCmView && !node.jView?.value;
    const rendersThroughTemplate = node.isPage || (hasOwnTemplate && !showsCmView);
    if (rendersThroughTemplate) {
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

    // Module render with view null. The server picks the node's j:view, else 'cm', else 'default'.
    // A node without a template of its own checks for 'cm' here, on the server. CSS is injected by
    // fetching a page render; for a node with its own template, that render is the node itself.
    // That self render is shared by no other item, so a cssSourceView keeps it from blocking the preview.
    // Otherwise the CSS comes from the nearest displayable ancestor, when it is a non-folder page.
    let cssSource = {};
    if (hasOwnTemplate) {
        cssSource = {cssSourcePath: node.path, cssSourceView: 'default'};
    } else if (isDisplayablePage) {
        cssSource = {cssSourcePath: displayableNode.path};
    }

    return {
        primary: {
            ...base,
            path: node.path,
            view: null,
            contextConfiguration: 'module',
            ...cssSource,
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
