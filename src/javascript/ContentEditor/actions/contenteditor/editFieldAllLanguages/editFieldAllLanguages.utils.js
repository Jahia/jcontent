import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';

const adaptDecimalValue = (requiredType, value) => {
    return (requiredType === 'DECIMAL' || requiredType === 'DOUBLE') ? value && value.replace(',', '.') : value;
};

/**
 * Adapt a `fieldValuesByLanguage` query entry for one language into the same shape the main
 * editor's Formik would hold for this field, by feeding it through the field's own selectorType
 * adaptValue (mirrors useEditFormDefinition's getFieldValues, minus the decrypted/reference variants
 * that this lean single-field query does not fetch).
 */
export const adaptRowValue = (field, languageValue) => {
    const selectorType = resolveSelectorType(field);

    if (!languageValue || languageValue.values.length === 0) {
        return selectorType.initValue ? selectorType.initValue(field) : undefined;
    }

    const strings = languageValue.values.map(value => value.string);
    const property = {
        value: strings[0],
        values: strings,
        notZonedDateValue: strings[0],
        notZonedDateValues: strings
    };

    return selectorType.adaptValue ?
        selectorType.adaptValue(field, property) :
        (field.multiple ? property.values : property.value);
};

/**
 * Whether a field's current value counts as filled in - used for the "languages filled" counter.
 */
export const hasValue = (field, value) => {
    if (field.multiple) {
        return (value || []).some(v => v !== undefined && v !== '');
    }

    return value !== undefined && value !== null && value !== '';
};

export const hasValueChanged = (field, originalValue, currentValue) => {
    if (field.multiple) {
        const original = originalValue || [];
        const current = currentValue || [];
        return original.length !== current.length || original.some((value, index) => value !== current[index]);
    }

    return originalValue !== currentValue;
};

/**
 * Build the InputJCRProperty (or InputJCRDeletedProperty) mutation entry for one language's edited
 * value, matching the shape ContentEditor's own save flow builds in fields.utils.js#updateValue.
 */
export const buildPropertyMutation = (field, language, value) => {
    if (field.multiple) {
        const filteredValues = (value || [])
            .filter(v => v !== undefined && v !== '')
            .map(v => adaptDecimalValue(field.requiredType, v));

        return filteredValues.length === 0 ?
            {toDelete: {name: field.propertyName, language}} :
            {toSave: {name: field.propertyName, type: field.requiredType, language, values: filteredValues}};
    }

    if (!hasValue(field, value)) {
        return {toDelete: {name: field.propertyName, language}};
    }

    return {toSave: {name: field.propertyName, type: field.requiredType, language, value: adaptDecimalValue(field.requiredType, value)}};
};
