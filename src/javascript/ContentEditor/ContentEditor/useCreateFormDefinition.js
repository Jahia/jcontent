import {adaptSystemNameField} from './adaptSystemNameField';
import {getFields} from '~/ContentEditor/utils/fields.utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {adaptSections, getExpandedSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {getFieldValuesFromDefaultValues} from '~/ContentEditor/ContentEditor/getFieldValuesFromDefaultValues';
import {CreateFormQuery} from '~/ContentEditor/ContentEditor/create.gql-queries';
import {useFormDefinition} from '~/ContentEditor/ContentEditor/useFormDefinitions';

// TODO https://jira.jahia.org/browse/TECH-300

const getInitialValues = (sections, nodeData) => {
    // Work in progress default value
    const wipInfo = {[Constants.wip.fieldName]: {status: nodeData.defaultWipInfo.status, languages: nodeData.defaultWipInfo.languages}};
    const name = {[Constants.systemName.name]: nodeData.newName};

    // Retrieve dynamic auto-enabled mixins
    const autoActivatedMixins = sections.flatMap(s => s.fieldSets).filter(fs => fs.activated && fs.dynamic).reduce((result, fs) => ({...result, [fs.name]: true}), {});

    // Retrieve fields and then return object contains the field name as the key and the field value as the value
    const fieldDefaultValues = getFields(sections).reduce((result, field) => ({...result, ...getFieldValuesFromDefaultValues(field)}), {});

    return {...fieldDefaultValues, ...autoActivatedMixins, ...wipInfo, ...name};
};

/**
 * This fct allow to adapt/modify the form data in create form
 * @param data Data from BackEnd
 * @param lang current lang
 * @param t translation fct
 * @param contentEditorConfigContext the editor config context
 */
export const adaptCreateFormData = (data, lang, t, contentEditorConfigContext) => {
    const nodeData = data.jcr.result;
    const sections = adaptSections(data.forms.createForm.sections);

    const formData = {
        sections,
        expandedSections: getExpandedSections(sections),
        initialValues: {
            ...getInitialValues(sections, nodeData)
        },
        hasPreview: false,
        nodeData,
        details: {},
        technicalInfo: [],
        title: t('jcontent:label.contentEditor.create.title', {type: data.jcr.nodeTypeByName.displayName}),
        nodeTypeDisplayName: data.jcr.nodeTypeByName.displayName,
        nodeTypeName: data.jcr.nodeTypeByName.name
    };

    adaptSystemNameField(formData, data.jcr.nodeTypeByName);

    if (contentEditorConfigContext.name) {
        formData.initialValues[Constants.systemName.name] = contentEditorConfigContext.name;
    }

    return formData;
};

export const useCreateFormDefinition = () => useFormDefinition(CreateFormQuery, adaptCreateFormData);
