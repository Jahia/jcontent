import {Constants} from '~/ContentEditor/ContentEditor.constants';

export function getChildrenOrder(formValues, nodeData, sections) {
    const doNotModifyReturn = {shouldModifyChildren: false, childrenOrder: []};
    if (!formValues['Children::Order'] || formValues['Children::Order'].length === 1) {
        return doNotModifyReturn;
    }

    const orderingFieldSet = sections?.reduce((found, section) =>
        found || section.fieldSets.find(fs => fs.name === Constants.ordering.automaticOrdering.mixin), null);
    if (orderingFieldSet?.readOnly) {
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
