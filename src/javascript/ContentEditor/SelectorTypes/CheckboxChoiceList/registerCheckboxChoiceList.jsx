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
            if (field.valueConstraints?.length > 5) {
                return <MultipleLeftRightSelector field={field} value={value} onChange={onChange}/>;
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
