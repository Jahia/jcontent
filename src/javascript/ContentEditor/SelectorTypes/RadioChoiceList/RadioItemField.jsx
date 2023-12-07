import {useTranslation} from 'react-i18next';
import {RadioItem} from '@jahia/moonstone';
import React from 'react';
import PropTypes from 'prop-types';

export const RadioItemField = ({fieldId, item, ...props}) => {
    const {t} = useTranslation();

    const label = item.displayValueKey ? t(item.displayValueKey) : item.displayValue;
    const value = item.value.string;
    return (
        <RadioItem
            {...props}
            id={`${fieldId}-${value}`}
            label={label}
            value={value}/>
    );
};

RadioItemField.propTypes = {
    fieldId: PropTypes.string,
    item: PropTypes.object
};
