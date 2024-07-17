import {getFieldValues} from '../../../ContentEditor/useEditFormDefinition';

/**
 * This function get the full name of a language by his id
 *
 * @param languages list of available languages
 * @param id language id to get
 * @returns the display name of a language
 */
export function getFullLanguageName(languages, id) {
    return languages.find(language =>
        language.language === id
    ).uiLanguageDisplayName;
}

/**
 * This function get the internationalized fields and their associated values from a form
 * @param formAndData form and values of a node
 * @returns The internationalized field and their values
 */
export function getI18nFieldAndValues(formAndData) {
    const {forms, jcr} = formAndData.data;
    let i18nFields = forms.editForm.sections
        .flatMap(section => section.fieldSets)
        .flatMap(fieldSet => fieldSet.fields)
        .filter(field => field.i18n)
        .map(field => ({...field, propertyName: field.name}));

    const adaptedValues = i18nFields.map(field => getFieldValues(field, jcr?.result)).reduce((acc, current) => ({...acc, ...current}), {});

    return jcr.result.properties
        .filter(property => i18nFields.map(field => field.name).indexOf(property.name) > -1)
        .map(property => {
            const isMultiple = i18nFields.find(field => field.name === property.name).multiple;
            return {
                ...property,
                multiple: isMultiple,
                ...(isMultiple ? {values: adaptedValues[property.name]} : {value: adaptedValues[property.name]})
            };
        });
}
