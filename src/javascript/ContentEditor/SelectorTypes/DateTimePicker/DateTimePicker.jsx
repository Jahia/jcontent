import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Typography} from '@jahia/moonstone';

import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import {toDate, toUtcIsoString} from 'date-formatter';
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
    const forceDateFormat = window.contextJsParameters?.config?.jcontent?.forceDateFormat?.trim();
    if (forceDateFormat && !allowedOverridesDateFormat.includes(forceDateFormat)) {
        console.warn(`forceDateFormat as been set to an invalid value (${forceDateFormat}). Please use one of the following values: ${allowedOverridesDateFormat.join(', ')}`);
    } else if (forceDateFormat) {
        return forceDateFormat;
    }

    // Fallback on browser language date format
    return userNavigatorLocale in specificDateFormat ? specificDateFormat[userNavigatorLocale] : 'DD/MM/YYYY';
}

// The browser's own IANA zone name (e.g. "America/New_York") -- shown alongside every date/time
// field so the displayed value is never ambiguous about whose timezone it's in.
const browserTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

export const DateTimePicker = ({id, field, value, editorContext, onChange, onBlur}) => {
    const {t} = useTranslation('jcontent');
    const variant = variantMapper[field.selectorType];
    const isDateTime = variant === 'datetime';
    const disabledDays = fillDisabledDaysFromJCRConstraints(field, isDateTime);
    const uilang = useSelector(state => state.uilang);

    const dateFormat = getDateFormat(editorContext);

    const displayDateFormat = isDateTime ? (dateFormat + ' HH:mm') : dateFormat;

    const maskLocale = String(dateFormat).replace(/[^\W]+?/g, '_');

    const displayDateMask = isDateTime ? maskLocale + ' __:__' : maskLocale;

    return (
        <div>
            <DatePickerInput
                dayPickerProps={{disabledDays}}
                lang={uilang}
                initialValue={value ? toDate(value) : null}
                displayDateFormat={displayDateFormat}
                displayDateMask={displayDateMask}
                readOnly={field.readOnly}
                variant={variant}
                id={id}
                aria-labelledby={`${field.name}-label`}
                onChange={date => {
                    // The value stored server-side is a real UTC instant; the picker itself always
                    // works in the browser's own local time (typed digits in, displayed digits out).
                    onChange(date && toUtcIsoString(date));
                }}
                onBlur={onBlur}
            />
            <Typography variant="caption" data-sel-role="date-field-timezone-hint">
                {t('jcontent:label.contentEditor.selectorTypes.localTimeHint', {zone: browserTimeZone})}
            </Typography>
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
