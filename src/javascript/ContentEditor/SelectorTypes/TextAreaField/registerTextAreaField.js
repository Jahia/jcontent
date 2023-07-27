import {TextAreaField} from './TextAreaField';

export const registerTextArea = ceRegistry => {
    ceRegistry.add('selectorType', 'TextArea', {
        dataType: ['String'],
        cmp: TextAreaField,
        labelKey: 'jcontent:label.contentEditor.selectorTypes.textArea.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.textArea.description'},
            {name: 'iconStart', value: 'Textarea'}
        ],
        supportMultiple: false
    });
};
