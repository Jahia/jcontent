/**
 * Shared preview context builder.
 *
 * Produces a previewContext object consumed by useContentPreview
 * and passed to PreviewViewers / IframeViewer.
 *
 * Two factory functions are provided:
 *  - buildCEPreviewContext: used by Content Editor
 *  - buildPreviewContextFromNode: used by JContentPreview side panel
 *    NOTE: requires `displayableNode` on the node object — ensure the content
 *    table GQL query includes this field before wiring Phase 6.
 */

/**
 * Builds a previewContext from the Content Editor context data
 */
export const buildCEPreviewContext = (currentPage, nodeData, language) => {
    let nodePath = nodeData.path;
    let path = currentPage.path;
    if (path !== nodePath) {
        if (nodeData.isPage) {
            path = nodePath;
        } else {
            path = decodeURIComponent(path);
        }
    }

    const requestAttributes = [{name: 'ce_preview', value: nodeData.uuid}];
    if (path !== nodePath && !nodeData.isPage) {
        requestAttributes.push({
            name: 'ce_preview_wrapper',
            value: nodePath
        });
    }

    const requestParameters = [];
    if (currentPage.queryString) {
        let queryString = currentPage.queryString;
        if (queryString.startsWith('?')) {
            queryString = queryString.substring(1);
        }

        queryString.split('&').forEach(entry => {
            const param = entry.split('=');
            requestParameters.push({
                name: param[0],
                value: decodeURIComponent(param[1] || '')
            });
        });
    }

    return {
        path,
        workspace: 'edit',
        view: nodeData.jView?.value || currentPage.template,
        contextConfiguration: currentPage.config,
        templateType: 'html',
        language,
        requestAttributes,
        requestParameters
    };
};

const buildInContextModuleContext = (node, closestPage, jView, base) => ({
    ...base,
    path: node.path,
    view: jView?.value || 'default',
    contextConfiguration: 'module',
    mainResourcePath: closestPage.path,
    cssSourcePath: closestPage.path
});

/**
 * Builds a previewContext from a JContent node (previewSelection).
 *
 * Three rendering strategies depending on mode and node type:
 *
 * 1. In-context sub-component/list (pages mode, !isDisplayableNode):
 *    Full page render at closestPage.path + requestAttributes for zoom.
 *    Falls back via fallbackPreviewContext (strategy 2) if zoom fails.
 *
 * 2. In-context main-resource (pages mode, isDisplayableNode):
 *    Module render of the node itself with page CSS injected (cssSourcePath).
 *    Avoids the pagination problem (main-resource may not be on the current page).
 *
 * 3. Out-of-context (contents/media/search mode):
 *    isDisplayableNode → content-template render (config=page)
 *    otherwise         → raw module render, view=null lets server use j:view→cm fallback
 */
export const buildPreviewContextFromNode = (node, language, mode) => {
    const {displayableNode, pageAncestors, jView} = node;
    const closestPage = pageAncestors?.at(-1);
    const isInContextRendering = mode === 'pages' && Boolean(closestPage) && !node.isPage;
    const isDisplayableNode = displayableNode?.path === node.path;

    const base = {workspace: 'edit', templateType: 'html', language};

    if (isInContextRendering) {
        if (isDisplayableNode) {
            return buildInContextModuleContext(node, closestPage, jView, base);
        }

        // Sub-component or list: full page render + zoom. Falls back to module+CSS on zoom failure.
        return {
            ...base,
            path: closestPage.path,
            view: 'default',
            contextConfiguration: 'page',
            requestAttributes: [
                {name: 'ce_preview', value: node.uuid},
                {name: 'preview_wrapper', value: node.path}
            ]
        };
    }

    // Out-of-context: view=null lets the server apply the j:view→cm fallback chain.
    return {
        ...base,
        path: node.path,
        view: isDisplayableNode ? (jView?.value || 'default') : null,
        contextConfiguration: isDisplayableNode ? 'page' : 'module'
    };
};

/**
 * Returns the module+CSS fallback context for sub-components/lists in pages mode.
 * Used by Preview when zoom fails on the primary full-page render.
 * Returns null for all other cases (no fallback needed).
 */
export const buildFallbackPreviewContextFromNode = (node, language, mode, previousContext) => {
    const {displayableNode, pageAncestors, jView} = node;
    const closestPage = pageAncestors?.at(-1);
    const isInContextRendering = mode === 'pages' && Boolean(closestPage) && !node.isPage;
    const isDisplayableNode = displayableNode?.path === node.path;

    if (isInContextRendering && !isDisplayableNode) {
        return buildInContextModuleContext(node, closestPage, jView, {
            workspace: 'edit',
            templateType: 'html',
            language
        });
    }

    return null;
};
