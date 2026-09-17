import React from 'react';
import PropTypes from 'prop-types';
import {DateTimeInput} from '@jahia/moonstone';
import {dayjs, toDate, toUtcIsoString} from 'date-formatter';
import {useTranslation} from 'react-i18next';

// Moonstone's modes; only 'zonedDateTime' renders the timezone selector
const variantToType = {
    date: 'date',
    datetime: 'dateTime',
    zonedDatetime: 'zonedDateTime'
};

const dayjsToLdmlToken = {YYYY: 'yyyy', YY: 'yy', DD: 'dd', D: 'd'};

const timezoneSelectorProps = {'data-sel-role': 'date-field-timezone-selector'};

// 'DD/MM/YYYY HH:mm' -> 'dd/MM/yyyy'
const toLdmlDateFormat = format => (format ?
    String(format).replace(/[Hhms:]/g, '').trim().replaceAll(/YYYY|YY|DD|D/g, token => dayjsToLdmlToken[token]) :
    undefined);

// A zoned value is a Temporal.Instant; the other modes emit a local wall-clock date / date-time
const toConsumerDate = (value, type) => {
    if (!value) {
        return null;
    }

    return type === 'zonedDateTime' ?
        new Date(Number(value.epochMilliseconds)) :
        toDate(value.toString());
};

// Moonstone takes ISO strings, never a Date: an instant for the zoned mode, a local wall-clock otherwise
const toMoonstoneValue = (initialValue, type) => {
    if (!initialValue) {
        return null;
    }

    if (type === 'zonedDateTime') {
        return toUtcIsoString(initialValue);
    }

    return dayjs(initialValue).format(type === 'dateTime' ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD');
};

export const DatePickerInput = ({
    variant = 'date',
    lang,
    minDate,
    maxDate,
    onChange = () => {},
    onBlur = () => {},
    initialValue = null,
    readOnly = false,
    displayDateFormat = null,
    ...props
}) => {
    const {t} = useTranslation('jcontent');
    const type = variantToType[variant];
    const dateFormat = toLdmlDateFormat(displayDateFormat);

    const i18n = React.useMemo(() => ({
        todayButton: t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.today'),
        nextMonth: t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.nextMonth'),
        previousMonth: t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.previousMonth'),
        timezone: t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.timezone')
    }), [t]);

    const value = toMoonstoneValue(initialValue, type);

    return (
        <DateTimeInput
            type={type}
            size="big"
            locale={lang}
            dateFormat={dateFormat}
            minDate={minDate}
            maxDate={maxDate}
            value={value}
            isReadOnly={readOnly}
            data-sel-readonly={readOnly}
            timezoneSelectorProps={timezoneSelectorProps}
            i18n={i18n}
            onChange={(event, newValue) => onChange(toConsumerDate(newValue, type))}
            onBlur={onBlur}
            {...props}
        />
    );
};

DatePickerInput.propTypes = {
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    lang: PropTypes.oneOf(['fr', 'en', 'de']).isRequired,
    variant: PropTypes.oneOf(['date', 'datetime', 'zonedDatetime']),
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    // eslint-disable-next-line react/boolean-prop-naming
    readOnly: PropTypes.bool,
    displayDateFormat: PropTypes.string
};

DatePickerInput.displayName = 'DatePickerInput';
