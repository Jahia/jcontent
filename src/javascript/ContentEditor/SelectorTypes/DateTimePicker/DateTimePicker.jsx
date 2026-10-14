import React from 'react';
import PropTypes from 'prop-types';
import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import {toDate, toUtcIsoString} from 'date-formatter';
import {pickerBoundsFromJCRConstraints, dateOnlyFromIsoString, toDateOnlyIsoString} from './DateTimePicker.utils';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {specificDateFormat} from './DateTimePicker.formats';
import {useSelector} from 'react-redux';

const variantMapper = {
    DatePicker: 'date',
    DateTimePicker: 'datetime'
};

// The only fields that show a timezone selector: the start/end of a visibility condition, where
// the author reasons about an instant in a given zone. Every other DateTimePicker field is a
// plain date + time in the browser's zone, as before.
const ZONED_NODE_TYPES = ['jnt:startEndDateCondition'];

const getVariant = field => {
    const variant = variantMapper[field.selectorType];
    return variant === 'datetime' && ZONED_NODE_TYPES.includes(field.declaringNodeType) ? 'zonedDatetime' : variant;
};

function getDateFormat(editorContext) {
    const userNavigatorLocale = editorContext.browserLang;
    const allowedOverridesDateFormat = ['MM/DD/YYYY', 'DD/MM/YYYY'];

    // Read date format from config
    const forceDateFormat = window.contextJsParameters?.config?.jcontent?.forceDateFormat?.trim();
    if (forceDateFormat && !allowedOverridesDateFormat.includes(forceDateFormat)) {
        console.warn(`forceDateFormat as been set to an invalid value (${forceDateFormat}). Please use one of the following values: ${allowedOverridesDateFormat.join(', ')}`);
    } else if (forceDateFormat) {
        return forceDateFormat;
    }

    // Fallback on browser language date format
    return userNavigatorLocale in specificDateFormat ? specificDateFormat[userNavigatorLocale] : 'DD/MM/YYYY';
}

export const DateTimePicker = ({id, field, value, editorContext, onChange, onBlur}) => {
    const variant = getVariant(field);
    const isDateTime = variant !== 'date';
    // Calendar-day bounds from the JCR range constraint
    const bounds = pickerBoundsFromJCRConstraints(field, isDateTime);
    const uilang = useSelector(state => state.uilang);

    const dateFormat = getDateFormat(editorContext);

    const displayDateFormat = isDateTime ? (dateFormat + ' HH:mm') : dateFormat;

    let initialValue = null;
    if (value) {
        initialValue = isDateTime ? toDate(value) : dateOnlyFromIsoString(value);
    }

    return (
        <div>
            <DatePickerInput
                {...bounds}
                lang={uilang}
                initialValue={initialValue}
                displayDateFormat={displayDateFormat}
                readOnly={field.readOnly}
                variant={variant}
                id={id}
                aria-labelledby={`${field.name}-label`}
                onChange={date => {
                    // Force touch: a calendar pick lands after the input's blur, so validate on the change itself.
                    // If not valid dates, pass raw data to onChange for validation
                    if (!date || !(date instanceof Date)) {
                        onChange(date, true);
                        return;
                    }

                    // DateTimePicker stores a UTC instant; DatePicker has no time-of-day, its
                    // calendar day is stored literally.
                    onChange(isDateTime ? toUtcIsoString(date) : toDateOnlyIsoString(date), true);
                }}
                onBlur={onBlur}
            />
        </div>
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
