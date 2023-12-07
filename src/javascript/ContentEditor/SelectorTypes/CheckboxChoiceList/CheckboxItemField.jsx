import {useTranslation} from 'react-i18next';
import {CheckboxItem} from '@jahia/moonstone/dist/components/CheckboxGroup/CheckboxItem';
import React from 'react';
import PropTypes from 'prop-types';

export const CheckboxItemField = ({fieldId, item, checked, ...props}) => {
    const {t} = useTranslation();

    const label = item.displayValueKey ? t(item.displayValueKey) : item.displayValue;
    const value = item.value.string;
    return (
        <CheckboxItem
            {...props}
            id={`${fieldId}-${value}`}
            label={label}
            value={value}
            checked={checked}
        />
    );
};

CheckboxItemField.propTypes = {
    fieldId: PropTypes.string,
    item: PropTypes.object
};
