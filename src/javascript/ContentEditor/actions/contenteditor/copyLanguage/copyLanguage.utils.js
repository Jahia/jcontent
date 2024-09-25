import {getInitialValues} from '../../../ContentEditor/useEditFormDefinition';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';

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
 * This function gets the internationalized fields and their associated values from a form
 *
 * @param formAndData form and values of a node
 * @returns The internationalized field and their values
 */
export function getI18nFieldAndValues(formAndData) {
    const {forms, jcr} = formAndData.data;
    const adaptedSections = adaptSections(forms.editForm.sections);
    const initialValues = getInitialValues(jcr.result, adaptedSections);
    let i18nFields = adaptedSections
        .flatMap(section => section.fieldSets)
        .flatMap(fieldSet => fieldSet.fields)
        .filter(field => field.i18n)
        .map(field => ({...field, propertyName: field.name}));

    return i18nFields.reduce((acc, field) => ({...acc, [field.propertyName]: initialValues[field.propertyName]}), {});
}
