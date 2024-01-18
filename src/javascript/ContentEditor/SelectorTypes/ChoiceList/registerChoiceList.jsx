import {ChoiceList} from './ChoiceList';
import {registerChoiceListActions} from './actions/registerChoiceListActions';
import {registerChoiceListOnChange} from './registerChoiceListOnChange';

export const registerChoiceList = ceRegistry => {
    const choiceListConfig = {
        dataType: ['String'],
        cmp: ChoiceList,
        supportMultiple: true,
        labelKey: 'jcontent:label.contentEditor.selectorTypes.dropdown.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.dropdown.description'},
            {name: 'iconStart', value: 'ListSelection'}
        ],
        initValue: field => {
            const defaultValueConstraints = field.valueConstraints.filter(v => v?.properties?.find(p => p.name === 'defaultProperty' && p.value === 'true'));

            if (defaultValueConstraints.length > 0) {
                return field.multiple ? defaultValueConstraints.map(v => v.value.string) : defaultValueConstraints[0].value.string;
            }
        }
    };

    // Since we use proper casing 'ChoiceList' on the selectorType overrides (RadioChoiceList, CheckboxChoiceList),
    // Add 'ChoiceList' for consistency, but also keep 'Choicelist' for compatibility
    ceRegistry.add('selectorType', 'ChoiceList', choiceListConfig);
    ceRegistry.add('selectorType', 'Choicelist', choiceListConfig);

    registerChoiceListActions(ceRegistry);
    registerChoiceListOnChange(ceRegistry);
};
