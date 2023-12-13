import React from 'react';
import {CheckboxGroup} from '@jahia/moonstone';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import PropTypes from 'prop-types';
import {CheckboxItemField} from './CheckboxItemField';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/ContentEditor/utils';
import styles from './CheckboxChoiceList.scss';

const ButtonRenderer = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {variant: 'ghost'}});

export const CheckboxChoiceList = ({field, value = [], id, inputContext, onChange, onBlur}) => {
    inputContext.actionContext = {onChange, onBlur};

    const items = field.valueConstraints;
    if (!items) {
        return;
    }

    const isInverted = field.selectorOptions?.some(option => option.name === 'isInvertedSelection');

    // Check if value is a valid item in the list otherwise reset to null
    if (value && value.length > 0) {
        const availableValues = items.map(item => item.value.string);
        const actualValues = availableValues.filter(v => value.includes(v));
        if (actualValues.length !== value.length) {
            onChange(actualValues);
        }
    }

    const checkboxOnChange = (ev, val, checked) => {
        const valIndex = value.findIndex(v => v === val);
        const isChecked = isInverted ? !checked : checked;
        if (isChecked && valIndex < 0) {
            onChange(value.concat(val)); // Add to values if it doesn't exist
        } else if (!isChecked && valIndex >= 0) {
            const clone = [...value];
            clone.splice(valIndex, 1);
            onChange(clone);
        }
    };

    return (
        <div className={styles.checkboxChoiceList}>
            <CheckboxGroup
                name={id}
                isReadOnly={field.readOnly}
                data-sel-content-editor-select-readonly={field.readOnly}
                onChange={checkboxOnChange}
            >
                {items.map(item => (
                    <CheckboxItemField
                        key={item.value.string}
                        fieldId={id}
                        item={item}
isChecked={isInverted ? !value?.includes(item.value.string) : value?.includes(item.value.string)}/>
                ))}
            </CheckboxGroup>
            {inputContext.displayActions && (
                <DisplayAction actionKey="content-editor/field/Choicelist"
                               field={field}
                               inputContext={inputContext}
                               render={ButtonRenderer}
                />
            )}
        </div>
    );
};

CheckboxChoiceList.propTypes = {
    field: FieldPropTypes.isRequired,
    value: PropTypes.string,
    id: PropTypes.string,
    inputContext: {
        actionContext: PropTypes.object,
        displayActions: PropTypes.object
    },
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
