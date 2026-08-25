import React from 'react';
import PropTypes from 'prop-types';
import {DateTimeInput} from '@jahia/moonstone';
import {dayjs} from 'date-formatter';
import {useTranslation} from 'react-i18next';

import styles from './DatePickerInput.scss';

const variantToType = {
    date: 'date',
    datetime: 'dateTime'
};

const dayjsToLdmlToken = {YYYY: 'yyyy', YY: 'yy', DD: 'dd', D: 'd'};

// 'DD/MM/YYYY HH:mm' -> 'dd/MM/yyyy', the time being rendered by its own sub-input
const toLdmlDateFormat = format => (format ?
    String(format).replace(/[Hhms:]/g, '').trim().replaceAll(/YYYY|YY|DD|D/g, token => dayjsToLdmlToken[token]) :
    undefined);

const getBoundary = (disabledDays, boundary) => {
    const date = Array.isArray(disabledDays) && disabledDays.find(range => range?.[boundary])?.[boundary];
    return date ? dayjs(date).format('YYYY-MM-DD') : undefined;
};

// Unlike `new Date()`, dayjs reads a date-only ISO string as local time rather than UTC midnight
const toDate = value => (value ? dayjs(value.toString()).toDate() : null);

export const DatePickerInput = ({
    variant = 'date',
    lang,
    dayPickerProps = {},
    onChange = () => {},
    onBlur = () => {},
    initialValue = null,
    readOnly = false,
    displayDateFormat = null,
    displayDateMask,
    ...props
}) => {
    const {t} = useTranslation('jcontent');
    const type = variantToType[variant];
    const dateFormat = toLdmlDateFormat(displayDateFormat);
    const minDate = getBoundary(dayPickerProps.disabledDays, 'before');
    const maxDate = getBoundary(dayPickerProps.disabledDays, 'after');

    const value = initialValue ?
        dayjs(initialValue).format(type === 'dateTime' ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD') :
        null;

    return (
        <DateTimeInput
            className={styles.input}
            type={type}
            size="big"
            locale={lang}
            dateFormat={dateFormat}
            minDate={minDate}
            maxDate={maxDate}
            value={value}
            isReadOnly={readOnly}
            data-sel-readonly={readOnly}
            i18n={{todayButton: t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.today')}}
            onChange={(event, newValue) => onChange(toDate(newValue))}
            onBlur={onBlur}
            {...props}
        />
    );
};

DatePickerInput.propTypes = {
    dayPickerProps: PropTypes.object,
    lang: PropTypes.oneOf(['fr', 'en', 'de']).isRequired,
    variant: PropTypes.oneOf(['date', 'datetime']),
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    // eslint-disable-next-line react/boolean-prop-naming
    readOnly: PropTypes.bool,
    displayDateFormat: PropTypes.string,
    /**
     * @deprecated DateTimeInput handles its own input masking; this prop is ignored.
     */
    displayDateMask: PropTypes.string
};

DatePickerInput.displayName = 'DatePickerInput';
