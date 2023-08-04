import {Constants} from '~/ContentEditor/ContentEditor.constants';

const isContentOrFileNode = formData => {
    const pattern = '^/sites/[^/]*/(contents|files)$';
    const regex = RegExp(pattern);
    return formData.technicalInfo.filter(info => {
        return regex.test(info.value);
    }).length !== 0;
};

// TODO completely get rid of this adapter
export const adaptSystemNameField = (formData, primaryNodeType) => {
    const systemNameField = formData.sections
        .flatMap(section => section.fieldSets)
        .flatMap(fieldSet => fieldSet.fields)
        .find(field => field.name.endsWith('_' + Constants.systemName.propertyName));

    if (systemNameField) {
        // System name should be readonly for this specific nodetypes / should be in json overrides
        if (Constants.systemName.READONLY_FOR_NODE_TYPES.includes(primaryNodeType.name) || isContentOrFileNode(formData)) {
            systemNameField.readOnly = true;
        }
    }
};

