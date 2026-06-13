/**
 * Shared preview context builder.
 *
 * Produces a previewContext object consumed by useContentPreview (via @jahia/data-helper)
 * and passed to PreviewViewers / IframeViewer.
 *
 * Two factory functions are provided:
 *  - buildCEPreviewContext: used by Content Editor
 *  - buildPreviewContextFromNode: used by JContent PreviewDrawer (Phase 6)
 *    NOTE: requires `displayableNode` on the node object — ensure the content
 *    table GQL query includes this field before wiring Phase 6.
 */

/**
 * Derives contextConfiguration from a node's displayableNode.
 * 'page'   — node has a renderable displayable node (not a folder)
 * 'module' — everything else (components, sub-content, folders)
 */
const deriveContextConfiguration = displayableNode => {
    const isFullPage = displayableNode && !displayableNode.isFolder;
    return isFullPage ? 'page' : 'module';
};

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
        view: currentPage.template,
        contextConfiguration: currentPage.config,
        templateType: 'html',
        language,
        requestAttributes,
        requestParameters
    };
};

/**
 * Builds a previewContext from a JContent node (previewSelection).
 * Uses CE's contextConfiguration logic (Decision #7).
 *
 * @param {object} node      - JCR node object with { path, displayableNode, isPage, ... }
 *                             NOTE: node must include displayableNode (add to content table GQL query)
 * @param {string} language  - from Redux state.language
 * @param {string} workspace - 'edit' | 'live'
 */
export const buildPreviewContextFromNode = (node, language, workspace) => {
    const {displayableNode} = node;
    const isFullPage = displayableNode && !displayableNode.isFolder;
    const path = isFullPage ? displayableNode.path : node.path;
    const view = displayableNode ? 'default' : 'cm';
    const contextConfiguration = deriveContextConfiguration(displayableNode);

    return {
        path,
        workspace,
        view,
        contextConfiguration,
        templateType: 'html',
        language
    };
};
