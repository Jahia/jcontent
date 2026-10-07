import {Constants} from '~/ContentEditor/ContentEditor.constants';

export const isLockedChild = child => child.canMove === false;

// The server refuses a reorder when a child that the list shows is hidden
export const getHiddenChildrenCount = nodeData => nodeData?.hiddenChildrenCount ?? 0;

/**
 * Keeps each locked child at its position in the previous order, and fills the other positions with the
 * movable children in their reordered sequence.
 * @param {array} previous children before the move
 * @param {array} reordered the same children after the move
 * @param {function} isLocked tells whether an element of the lists is locked
 * @returns {array} children in their new order
 */
export const keepLockedChildrenInPlace = (previous, reordered, isLocked = isLockedChild) => {
    const movables = reordered.filter(child => !isLocked(child));
    let next = 0;
    return previous.map(child => (isLocked(child) ? child : movables[next++]));
};

export function getChildrenOrder(formValues, nodeData, sections) {
    const doNotModifyReturn = {shouldModifyChildren: false, childrenOrder: []};
    if (!formValues['Children::Order'] || formValues['Children::Order'].length === 1) {
        return doNotModifyReturn;
    }

    const orderingFieldSet = sections?.reduce((found, section) =>
        found || section.fieldSets.find(fs => fs.name === Constants.ordering.automaticOrdering.mixin), null);
    if (orderingFieldSet?.readOnly || getHiddenChildrenCount(nodeData) > 0) {
        return doNotModifyReturn;
    }

    const childrenOrder = formValues['Children::Order'].map(child => child.name);
    const orderedNames = new Set(childrenOrder);
    // The ordering field of a page lists only its sub-pages, so compare with those children alone
    const initialOrder = nodeData.children.nodes.map(child => child.name).filter(name => orderedNames.has(name));
    const isChangedOrder = childrenOrder.some((name, i) => initialOrder[i] !== name);

    if (!isChangedOrder) {
        return doNotModifyReturn;
    }

    return {
        childrenOrder,
        shouldModifyChildren: true
    };
}
