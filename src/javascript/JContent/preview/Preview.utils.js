export const getSiblings = function (elem) {
    let siblings = [];
    let sibling = elem.parentNode.firstChild;

    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== elem && sibling.tagName !== 'LINK' && sibling.tagName !== 'SCRIPT') {
            siblings.push(sibling);
        }

        sibling = sibling.nextSibling;
    }

    return siblings;
};

export const removeSiblings = element => {
    for (const sibling of getSiblings(element)) {
        element.parentNode.removeChild(sibling);
    }

    if (element.parentNode && element.parentNode.tagName !== 'BODY') {
        removeSiblings(element.parentNode);
    }
};

/**
 * Force the display of the HTML element by checking if it's using display: none style.
 * Recursive — also checks parent nodes.
 */
export const forceDisplay = element => {
    if (element.style.display === 'none') {
        element.style.display = '';
    }

    if (element.parentNode && element.parentNode.tagName !== 'BODY') {
        forceDisplay(element.parentNode);
    }
};

/**
 * Zooms the iframe to the specific content node being previewed.
 * Finds #ce_preview_content and removes surrounding elements.
 * Skipped if the rendered HTML contains 'ce_preview_skip_zoom'.
 *
 * @param {Document} iframeDocument
 * @param {Function} onContentNotFound - called when the zoom anchor is missing and not a page/content-template
 * @param {object} nodeData - { isPage, displayableNode, path } from the node being edited
 */
export function zoom(iframeDocument, onContentNotFound, nodeData) {
    const isPage = nodeData?.isPage;
    const isContentTemplate = nodeData?.displayableNode &&
        nodeData.displayableNode.path === nodeData.path;

    if (iframeDocument.documentElement?.innerHTML &&
        !iframeDocument.documentElement.innerHTML.includes('ce_preview_skip_zoom')) {
        const contentPreview = iframeDocument.getElementById('ce_preview_content');
        if (contentPreview) {
            removeSiblings(contentPreview);
            forceDisplay(contentPreview);
        } else if (!isPage && !isContentTemplate) {
            onContentNotFound();
        }
    }
}
