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
 *    - Always module render. CSS injected via cssSourcePath:
 *      isDisplayableNode → cssSourcePath=node.path (its own default page render provides CSS).
 *      !isDisplayableNode → cssSourcePath=displayableNode.path if non-folder, else no CSS.
 *
 * @param {object} node                 - JCR node with { path, uuid, isPage, displayableNode, jView }
 * @param {string} language
 * @param {object} options
 * @param {object} [options.closestPage]        - { path, view? } — the hosting page context.
 *   JContent: pageAncestors.at(-1). CE: pageComposerCurrentPage or displayableNode ancestor.
 * @param {boolean} [options.isCEPreview]  - Attach ce_preview requestAttribute to signal CE preview mode
 *   to other modules. true for CE, false for JContent.
 * @param {Array}   [options.requestParameters] - CE page composer query string params.
 */
export const buildPreviewContexts = (node, language, {closestPage = null, isCEPreview = false, requestParameters = []} = {}) => {
    const {displayableNode, jView} = node;
    const isDisplayableNode = displayableNode?.path === node.path;
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

    // Pages render as full page — CSS is included, no cssSourcePath needed.
    if (node.isPage) {
        return {
            primary: {
                ...base,
                path: node.path,
                view: jView?.value || 'default',
                contextConfiguration: 'page',
                ...(cePreviewAttr && {requestAttributes: cePreviewAttr}),
                ...extraParams
            },
            fallback: null
        };
    }

    // For out-of-context module renders, inject CSS by fetching the nearest displayable page.
    // isDisplayableNode: use the node itself (its default page render provides CSS).
    // !isDisplayableNode: use the displayable ancestor if it's a non-folder page.
    const displayableAncestorPath = displayableNode && !displayableNode.isFolder ? displayableNode.path : undefined;
    const cssSourcePath = isDisplayableNode ? node.path : displayableAncestorPath;

    return {
        primary: {
            ...base,
            path: node.path,
            view: isDisplayableNode ? (jView?.value || 'default') : null,
            contextConfiguration: 'module',
            ...(cssSourcePath && {cssSourcePath}),
            ...(cePreviewAttr && {requestAttributes: cePreviewAttr}),
            ...extraParams
        },
        fallback: null
    };
};

/**
 * JContent: builds { primary, fallback } from a content table node.
 * Derives closestPage from pageAncestors when in pages mode.
 */
export const buildPreviewContextsFromNode = (node, language, mode) => {
    const pageAncestor = node.pageAncestors?.at(-1);
    const closestPage = mode === 'pages' && pageAncestor && !node.isPage ?
        {path: pageAncestor.path} :
        null;
    return buildPreviewContexts(node, language, {closestPage});
};

/**
 * Preview context for a content sample shown in the content-type picker.
 *
 * A sample is rendered as a module, which returns the component on its own - exactly what the picker
 * wants to show - but collects no stylesheet. The CSS therefore comes from a page rendered alongside
 * it, named here rather than derived from where the sample is stored: samples are kept flat, with no
 * page around them, because a module render needs no displayable ancestor.
 *
 * That page is also passed as the main resource, so components that read the current page (links,
 * breadcrumbs, page properties) have one to read.
 *
 * @param {object} node - a sample carrying NodePreviewFields (jView)
 * @param {string} language
 * @param {string} previewPagePath - the page whose CSS the sample is dressed in
 * @returns {object|null} - a preview context, or null when there is no page to borrow from
 */
export const buildSamplePreviewContext = (node, language, previewPagePath) => {
    if (!node || !previewPagePath) {
        return null;
    }

    return buildInContextModuleContext(node, {path: previewPagePath}, node.jView, {
        workspace: 'edit',
        templateType: 'html',
        language
    });
};
