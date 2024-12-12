import React from 'react';
import PropTypes from 'prop-types';

import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import dayjs from 'dayjs';
import {fillDisabledDaysFromJCRConstraints} from './DateTimePicker.utils';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {specificDateFormat} from './DateTimePicker.formats';
import {useSelector} from 'react-redux';

const variantMapper = {
    DatePicker: 'date',
    DateTimePicker: 'datetime'
};

function getDateFormat(editorContext) {
    const userNavigatorLocale = editorContext.browserLang;
    const allowedOverridesDateFormat = ['MM/DD/YYYY', 'DD/MM/YYYY'];

    // Read date format from config
    const forceDateFormat = window.contextJsParameters?.config?.jcontent?.forceDateFormat;
    if (forceDateFormat && !allowedOverridesDateFormat.includes(forceDateFormat)) {
        console.warn(`forceDateFormat as been set to an invalid value (${forceDateFormat}). Please use one of the following values: ${allowedOverridesDateFormat.join(', ')}`);
    } else if (forceDateFormat) {
        return forceDateFormat;
    }

    // Fallback on browser language date format
    return userNavigatorLocale in specificDateFormat ? specificDateFormat[userNavigatorLocale] : 'DD/MM/YYYY';
}

export const DateTimePicker = ({id, field, value, editorContext, onChange, onBlur}) => {
    const variant = variantMapper[field.selectorType];
    const isDateTime = variant === 'datetime';
    const disabledDays = fillDisabledDaysFromJCRConstraints(field, isDateTime);
    const uilang = useSelector(state => state.uilang);

    const dateFormat = getDateFormat(editorContext);

    const displayDateFormat = isDateTime ? (dateFormat + ' HH:mm') : dateFormat;

    const maskLocale = String(dateFormat).replace(/[^\W]+?/g, '_');

    const displayDateMask = isDateTime ? maskLocale + ' __:__' : maskLocale;

    return (
        <DatePickerInput
            dayPickerProps={{disabledDays}}
            lang={uilang}
            initialValue={value ? dayjs(value).toDate() : null}
            displayDateFormat={displayDateFormat}
            displayDateMask={displayDateMask}
            readOnly={field.readOnly}
            variant={variant}
            id={id}
            inputProps={{
                'aria-labelledby': `${field.name}-label`
            }}
            onChange={date => {
                onChange(date && dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSS'));
            }}
            onBlur={onBlur}
        />
    );
};

DateTimePicker.defaultProps = {
    value: ''
};

DateTimePicker.propTypes = {
    id: PropTypes.string.isRequired,
    editorContext: PropTypes.shape({
        browserLang: PropTypes.string.isRequired
    }).isRequired,
    field: FieldPropTypes.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
