import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {allTimezones, useTimezoneSelect} from 'react-timezone-select';

export const TimezoneDropdown = ({onChange, value}) => {
    const timezones = {...allTimezones, 'America/Toronto': 'Toronto'};
    const {options, parseTimezone} = useTimezoneSelect({timezones});
    return (
        <select
            value={parseTimezone(value).value}
            onChange={e => onChange(parseTimezone(e.currentTarget.value).value)}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

TimezoneDropdown.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object
};
