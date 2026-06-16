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
 * In 'pages' mode with a jnt:page ancestor, uses in-context rendering:
 * renders the parent page and zooms to the specific node via ce_preview attributes.
 *
 * In all other modes (contents, media, search), uses standalone rendering:
 * renders the node's displayableNode directly.
 *
 * @param {object} node      - JCR node object with { path, uuid, displayableNode, isPage, pageAncestors, ... }
 *                             NOTE: node must include displayableNode and pageAncestors (from GQL query)
 * @param {string} language  - from Redux state.language
 * @param {string} workspace - 'edit' | 'live'
 * @param {string} mode      - accordion mode from Redux state.jcontent.mode (e.g. 'pages', 'contents', 'media')
 */
export const buildPreviewContextFromNode = (node, language, mode) => {
    const {displayableNode, pageAncestors} = node;
    const closestPage = pageAncestors?.at(-1);
    const isInPagesMode = mode === 'pages';
    const useInContextRendering = isInPagesMode && Boolean(closestPage);
    const view = (displayableNode || useInContextRendering) ? 'default' : 'cm';

    const isFullPage = displayableNode && !displayableNode.isFolder;
    const path = isFullPage ? displayableNode.path : node.path;

    if (useInContextRendering) {
        // Add this request attribute to activate PreviewWrapperFilter during rendering
        // which embeds id="ce_preview_content" to the resource node and to be able to zoom to it.
        const requestAttributes = node.isPage ? undefined : [{name: 'preview_wrapper', value: node.path}];

        return {
            path: closestPage.path,
            view,
            workspace: 'edit',
            contextConfiguration: 'page',
            templateType: 'html',
            language,
            requestAttributes,
            // mainResourcePath: closestPage.path
        };

        // return {
        //     path,
        //     view,
        //     workspace: 'edit',
        //     contextConfiguration: 'module',
        //     templateType: 'html',
        //     language,
        //     // requestAttributes,
        //     mainResourcePath: closestPage.path
        // };
    }

    return {
        path,
        workspace: 'edit',
        view,
        contextConfiguration: isFullPage ? 'page' : 'module',
        templateType: 'html',
        language
    };
};

export const oldbuildPreviewContextFromNode = (node, language) => {
    const {displayableNode} = node;
    const isFullPage = displayableNode && !displayableNode.isFolder;
    const path = isFullPage ? displayableNode.path : node.path;
    const view = displayableNode ? 'default' : 'cm';

    return {
        path,
        workspace: 'edit',
        view,
        contextConfiguration: isFullPage ? 'page' : 'module',
        templateType: 'html',
        language
    };
};
