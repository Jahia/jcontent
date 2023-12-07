import {CheckboxChoiceList} from './CheckboxChoiceList';
import {registerCheckboxChoiceListActions} from './actions/registerCheckboxChoiceListActions';

export const registerCheckboxChoiceList = registry => {
    registry.add('selectorType', 'CheckboxChoiceList', {
        dataType: ['String'],
        cmp: CheckboxChoiceList,
        supportMultiple: true,
        labelKey: 'jcontent:label.contentEditor.selectorTypes.checkbox.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.checkbox.description'},
            {name: 'iconStart', value: 'ListSelection'}
        ],
        initValue: field => {
            const findDefaultPropFn = v => v?.properties?.find(p => p.name === 'defaultProperty' && p.value === 'true');
            const defaultValueConstraints = field.valueConstraints?.filter(findDefaultPropFn);
            return defaultValueConstraints.map(v => v.value.string);
        }
    });
    registerCheckboxChoiceListActions(registry);
};
