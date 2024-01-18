import {RadioChoiceList} from './RadioChoiceList';

export const registerRadioChoiceList = ceRegistry => {
    ceRegistry.add('selectorType', 'RadioChoiceList', {
        dataType: ['String'],
        cmp: RadioChoiceList,
        supportMultiple: false,
        labelKey: 'jcontent:label.contentEditor.selectorTypes.radioButton.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.radioButton.description'},
            {name: 'iconStart', value: 'ListSelection'}
        ],
        initValue: field => {
            const findDefaultPropFn = v => v?.properties?.find(p => p.name === 'defaultProperty' && p.value === 'true');
            const defaultValueConstraints = field.valueConstraints?.find(findDefaultPropFn);
            return defaultValueConstraints?.value.string;
        }
    });
};
