import {MULTI_VALUE_OPERATORS, VALUELESS_OPERATORS, operatorLabelKeys, valuesOf} from '../filterConstraint';

const LABELS = 'jcontent:label.contentManager.filters';

/** The label of an operator, in the words of its field. */
export const operatorLabel = (t, field, operator) => t(operatorLabelKeys(field, operator));

const optionLabel = (field, value) => (field?.options || []).find(option => option.value === value)?.label || value;

/**
 * The value text of a chip: the operator and the value, such as `contains news`, `after 2026-11-01`,
 * `is Garage or Pool` or `is empty`. An empty text when the filter has no value.
 */
export const filterValueLabel = (t, field, filter) => {
    if (!filter) {
        return '';
    }

    const operator = operatorLabel(t, field, filter.operator);
    if (VALUELESS_OPERATORS.has(filter.operator)) {
        return operator;
    }

    if (MULTI_VALUE_OPERATORS.has(filter.operator)) {
        const values = valuesOf(filter.value).map(value => optionLabel(field, value));
        return values.length > 0 ? `${operator} ${values.join(t(`${LABELS}.valueSeparator`))}` : '';
    }

    const value = Array.isArray(filter.value) ? '' : String(filter.value ?? '').trim();
    return value === '' ? '' : `${operator} ${value}`;
};

/** The labels of the CollectionBar. A label with `{{name}}` keeps the placeholder, which CollectionBar fills. */
export const collectionBarLabels = t => ({
    toolbarLabel: t(`${LABELS}.toolbarLabel`),
    addFilter: t(`${LABELS}.addFilter`),
    filterName: t(`${LABELS}.filterName`, {name: '{{name}}'}),
    clearFilter: t(`${LABELS}.clearFilter`, {name: '{{name}}'}),
    clearAll: t(`${LABELS}.clearAll`),
    closeButton: t(`${LABELS}.close`)
});
