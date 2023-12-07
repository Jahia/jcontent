import React from 'react';
import {RadioGroup} from '@jahia/moonstone';
import {RadioItemField} from './RadioItemField';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import PropTypes from 'prop-types';

export const RadioChoiceList = ({field, value, id, onChange}) => {
    const items = field.valueConstraints;
    if (!items) {
        return;
    }

    // Check if value is a valid item in the list otherwise reset to null
    if (value && !items.find(item => item.value.string === value)) {
        onChange(null);
    }

    const radioOnChange = (ev, newValue) => {
        if (newValue !== value && typeof onChange === 'function') {
            onChange(newValue);
        }
    };

    return (
        <RadioGroup value={value || ''} onChange={radioOnChange}>
            {items.map(item => <RadioItemField key={item.value.string} fieldId={id} item={item}/>)}
        </RadioGroup>
    );
};

RadioChoiceList.propTypes = {
    field: FieldPropTypes.isRequired,
    value: PropTypes.string,
    id: PropTypes.string
};
