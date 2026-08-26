import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import {DatePicker} from '../DatePicker';

import {dayjs} from 'date-formatter';

import {Popover} from '@material-ui/core';
import NumberFormat from 'react-number-format';
import {Button, Calendar, Input} from '@jahia/moonstone';
import styles from './DatePickerInput.scss';

const datetimeFormat = {
    date: 'L',
    datetime: 'L HH:mm'
};

const formatDateTime = (datetime, lang, variant, displayDateFormat) => {
    if (!datetime) {
        return '';
    }

    return dayjs(datetime)
        .locale(lang)
        .format(displayDateFormat || datetimeFormat[variant]);
};

// A stored value that fails to parse into a real date (corrupt existing data, or a raw
// unparsable string round-tripped back in as initialValue) is still `instanceof Date` and
// truthy, but carries NaN internals -- passing it to the calendar crashes react-day-picker's
// month arithmetic. Treat it the same as no date at all when a component first mounts with it.
const sanitizeDate = date => (date instanceof Date && Number.isNaN(date.getTime()) ? null : date);

export const getMaskOptions = (displayDateMask, isDateTime) => {
    const defaultDateMask = isDateTime ? '__/__/____ __:__' : '__/__/____';
    const mask = displayDateMask ? displayDateMask : defaultDateMask;
    return {
        mask: mask.replace(/_/g, '#'),
        empty: mask
    };
};

export const DatePickerInput = ({
    variant,
    lang,
    dayPickerProps,
    onChange,
    onBlur,
    initialValue,
    readOnly,
    displayDateFormat,
    displayDateMask,
    ...props
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [datetime, setDatetime] = useState(sanitizeDate(initialValue));
    const [datetimeString, setDatetimeString] = useState(
        formatDateTime(sanitizeDate(initialValue), lang, variant, displayDateFormat)
    );

    useEffect(() => {
        // A truthy-but-unparseable initialValue only happens when the parent echoes back the raw
        // out-of-range text just typed/pasted (DateTimePicker forwards it through onChange
        // unconverted, for validation, then re-derives initialValue from it on the next render).
        // Resyncing from that echo would blank/reformat the field, wiping out the exact text the
        // "invalidDate" error needs to display against -- so leave the current display untouched.
        // It also keeps `datetime` at its last safe value instead of ever becoming an Invalid
        // Date, which is what crashed the calendar (Jahia/jcontent#2653) if it was opened
        // afterwards -- and unlike this effect, nothing else corrects that value back on its own.
        if (initialValue && !dayjs(initialValue).isValid()) {
            return;
        }

        setDatetime(initialValue);
        setDatetimeString(formatDateTime(initialValue, lang, variant, displayDateFormat));
    }, [setDatetime, setDatetimeString, initialValue, lang, variant, displayDateFormat]);

    const isDateTime = variant === 'datetime';
    const containerRef = useRef();
    const maskOptions = getMaskOptions(displayDateMask, isDateTime);

    const handleOpenPicker = () => {
        if (!readOnly) {
            setAnchorEl(containerRef.current);
        }
    };

    const handleInputChange = e => {
        if (e && e.target) {
            setDatetimeString(e.target.value);

            if (maskOptions.empty === e.target.value) {
                setDatetime(null);
                onChange(null);
            } else if (!e.target.value.includes('_')) {
                const newDate = dayjs(e.target.value, displayDateFormat || datetimeFormat[variant], lang, true);
                if (newDate.isValid()) {
                    setDatetimeString(newDate.locale(lang).format(displayDateFormat || datetimeFormat[variant]));
                    setDatetime(newDate.toDate());
                    onChange(newDate.toDate());
                } else {
                    onChange(e.target.value);
                }
            }
        }
    };

    const postfixComponent = (
        <Button aria-label="Open date picker"
                variant="ghost"
                icon={<Calendar/>}
                onClick={handleOpenPicker}
        />
    );

    return (
        <div ref={containerRef}>
            <NumberFormat
                customInput={Input}
                className={styles.input}
                size="big"
                format={maskOptions.mask}
                placeholder={maskOptions.empty}
                mask="_"
                data-sel-readonly={readOnly}
                postfixComponents={postfixComponent}
                isReadOnly={readOnly}
                value={datetimeString}
                onChange={handleInputChange}
                onBlur={onBlur}
                {...props}
            />
            <Popover open={Boolean(anchorEl)}
                     anchorEl={anchorEl}
                     anchorOrigin={{
                         vertical: 'bottom',
                         horizontal: 'left'
                     }}
                     transformOrigin={{
                         vertical: 'top',
                         horizontal: 'left'
                     }}
                     onClose={() => {
                         onChange(datetime);
                         onBlur();
                         setAnchorEl(null);
                    }}
            >
                <DatePicker
                    variant={variant}
                    lang={lang}
                    selectedDateTime={datetime}
                    onSelectDateTime={_datetime => {
                        setDatetime(_datetime);
                        setDatetimeString(
                            formatDateTime(_datetime, lang, variant, displayDateFormat)
                        );
                    }}
                    {...dayPickerProps}
                />
            </Popover>
        </div>
    );
};

DatePickerInput.defaultProps = {
    dayPickerProps: {},
    variant: 'date',
    onChange: () => {},
    onBlur: () => {},
    initialValue: null,
    readOnly: false,
    displayDateFormat: null,
    displayDateMask: null
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
    displayDateMask: PropTypes.string
};

DatePickerInput.displayName = 'DatePickerInput';
