export {buildPreviewContextFromEditorContext as getPreviewContext} from '~/JContent/preview/previewContext.utils';

export const getPreviewPath = nodeData => {
    if (nodeData.displayableNode && !nodeData.displayableNode.isFolder) {
        return nodeData.displayableNode.path;
    }

    return nodeData.path;
};

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

    // Stop recursion if no parent, or body is parent
    if (element.parentNode && element.parentNode.tagName !== 'BODY') {
        removeSiblings(element.parentNode);
    }
};

/**
 * Force the display of the HTML El, by checking if it's using display: node style
 * Recursive fct will check parents nodes aswell
 * @param element to force the display
 */
export const forceDisplay = element => {
    if (element.style.display === 'none') {
        element.style.display = '';
    }

    // Stop recursion if no parent, or body is parent
    if (element.parentNode && element.parentNode.tagName !== 'BODY') {
        forceDisplay(element.parentNode);
    }
};
