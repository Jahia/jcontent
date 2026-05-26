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

    const isChangedOrder = formValues['Children::Order'].find((child, i) => nodeData.children.nodes[i].name !== child.name);

    if (!isChangedOrder) {
        return doNotModifyReturn;
    }

    return {
        childrenOrder: formValues['Children::Order'].map(child => child.name),
        shouldModifyChildren: true
    };
}
