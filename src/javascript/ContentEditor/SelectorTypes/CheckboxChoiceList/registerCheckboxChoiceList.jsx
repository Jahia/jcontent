import {CheckboxChoiceList} from './CheckboxChoiceList';
import {registerCheckboxChoiceListActions} from './actions/registerCheckboxChoiceListActions';
import React from 'react';
import {MultipleLeftRightSelector} from '~/ContentEditor/SelectorTypes/MultipleLeftRightSelector';

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

    registry.add('selectorType', 'CheckboxesToMultiLeftRight', {
        dataType: ['String'],
        cmp: ({field, value, id, inputContext, onChange, onBlur}) => {
            let maxCheckboxes = 5;
            if (field.selectorOptions?.some(option => option.name === 'maxCheckboxes')) {
                maxCheckboxes = parseInt(field.selectorOptions.find(option => option.name === 'maxCheckboxes').value, 10);
            }

            if (field.valueConstraints?.length > maxCheckboxes) {
                return (
                    <MultipleLeftRightSelector field={field}
                                               value={value}
                                               labels={{
                    rightListTitle: 'jcontent:label.contentEditor.visibilityTab.languages.rightList',
                    leftListTitle: 'jcontent:label.contentEditor.visibilityTab.languages.leftList'
                }}
                                               onChange={onChange}/>
                );
            }

            return (
                <CheckboxChoiceList field={field}
                                    value={value}
                                    id={id}
                                    inputContext={inputContext}
                                    onBlur={onBlur}
                                    onChange={onChange}/>
            );
        },
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
