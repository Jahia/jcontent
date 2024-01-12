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

export const DateTimePicker = ({id, field, value, editorContext, onChange, onBlur}) => {
    const variant = variantMapper[field.selectorType];
    const isDateTime = variant === 'datetime';
    const disabledDays = fillDisabledDaysFromJCRConstraints(field, isDateTime);
    const uilang = useSelector(state => state.uilang);

    const userNavigatorLocale = editorContext.browserLang;

    let dateFormat = userNavigatorLocale in specificDateFormat ? specificDateFormat[userNavigatorLocale] : 'DD/MM/YYYY';
    let displayDateFormat = isDateTime ? (dateFormat + ' HH:mm') : dateFormat;

    let maskLocale = String(dateFormat).replace(/[^\W]+?/g, '_');

    const displayDateMask = isDateTime ? maskLocale + ' __:__' : maskLocale;

    console.log(`value: ${value}`);
    return (
        <DatePickerInput
            dayPickerProps={{disabledDays}}
            lang={uilang}
            // TODO fix this to use the correct timezone; remove any timezone for now
            initialValue={value ? dayjs(value, 'YYYY-MM-DDTHH:mm:ss').toDate() : null}
            displayDateFormat={displayDateFormat}
            displayDateMask={displayDateMask}
            readOnly={field.readOnly}
            variant={variant}
            id={id}
            inputProps={{
                'aria-labelledby': `${field.name}-label`
            }}
            onChange={dayjsDate => {
                const dateStr = dayjsDate?.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                console.log(`dateTimePicker: ${dateStr}`);
                onChange(dateStr);
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
