import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';

import {DatePicker} from '../DatePicker';
import {Input} from '@jahia/design-system-kit';

import dayjs from '../../date.config';

import {Popover} from '@material-ui/core';
import NumberFormat from 'react-number-format';
import {Button, Calendar} from '@jahia/moonstone';
import {TimezoneDropdown} from '../TimezoneDropdown';

export const getMaskOptions = (displayDateMask, variant) => {
    const mask = displayDateMask || (variant === 'datetime' ? '__/__/____ __:__' : '__/__/____');
    return {
        mask: mask.replace(/_/g, '#'),
        empty: mask
    };
};

const CustomInput = ({value, ...others}) => {
    return (
        <Input
            value={value}
            {...others}
        />
    );
};

const datetimeFormat = {date: 'L', datetime: 'L HH:mm'};
const useFormatDatetime = (lang, variant, displayDateFormat) => {
    const formatDatetime = datetime => {
        return !datetime ? '' :
            dayjs(datetime)
                .locale(lang)
                .format(displayDateFormat || datetimeFormat[variant]);
    };

    return {formatDatetime};
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

    const {formatDatetime} = useFormatDatetime(lang, variant, displayDateFormat);
    const [datetime, setDatetime] = useState(initialValue);
    const [datetimeString, setDatetimeString] = useState(formatDatetime(initialValue));
    // TODO extract timezone from given initialValue/offset, if it exists
    const [timezone, setTimezone] = useState(dayjs.tz.guess());

    const htmlInput = useRef();
    const maskOptions = getMaskOptions(displayDateMask, variant);

    const handleOpenPicker = () => {
        if (!readOnly) {
            setAnchorEl(htmlInput.current.parentElement);
        }
    };

    const handleInputChange = e => {
        if (e && e.target) {
            setDatetimeString(e.target.value);
            if (maskOptions.empty === e.target.value) {
                setDatetime(null);
                onChange(null);
            } else if (!e.target.value.includes('_')) {
                const newDate = dayjs(e.target.value, displayDateFormat || datetimeFormat[variant], lang);
                if (newDate.isValid()) {
                    setDatetimeString(formatDatetime(newDate));
                    setDatetime(newDate.toDate());
                    const dayjsDate = dayjs(newDate.toDate()).tz(timezone, true);
                    onChange(dayjsDate);
                } else {
                    const dayjsDate = dayjs(e.target.value).tz(timezone, true);
                    onChange(dayjsDate);
                }
            }
        }
    };

    const InteractiveVariant = (
        <Button aria-label="Open date picker"
                variant="ghost"
                icon={<Calendar/>}
                onClick={handleOpenPicker}
        />
    );

    return (
        <div>
            <NumberFormat
                inputRef={htmlInput}
                customInput={CustomInput}
                format={maskOptions.mask}
                placeholder={maskOptions.empty}
                mask="_"
                data-sel-readonly={readOnly}
                variant={{
                    interactive: InteractiveVariant
                }}
                readOnly={readOnly}
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
                         const dayjsDate = dayjs(datetime).tz(timezone, true);
                         onChange(dayjsDate);
                         onBlur();
                         setAnchorEl(null);
                    }}
            >
                <DatePicker
                    variant={variant}
                    lang={lang}
                    selectedDateTime={datetime}
                    onSelectDateTime={datetime => {
                        setDatetime(datetime);
                        setDatetimeString(
                            formatDatetime(datetime)
                        );
                    }}
                    {...dayPickerProps}
                />
            </Popover>
            <TimezoneDropdown value={timezone}
                              onChange={tz => {
                setTimezone(tz);
                onChange(datetime && dayjs(datetime).tz(tz, true));
            }}/>
        </div>
    );
};

CustomInput.propTypes = {
    value: PropTypes.string
};

CustomInput.defaultProps = {
    value: ''
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
