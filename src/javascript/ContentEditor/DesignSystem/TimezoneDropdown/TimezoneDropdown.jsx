import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from '@jahia/moonstone';
import {useTimezoneOptions} from './useTimezoneOptions';

export const TimezoneDropdown = ({onChange, value}) => {
    const {treeData, parseTimezone} = useTimezoneOptions();
    const selectedOption = parseTimezone(value);

    return (
        <Dropdown
            hasSearch
            variant="outlined"
            treeData={treeData}
            value={selectedOption.value}
            onChange={(e, opt) => {
                onChange(parseTimezone(opt.value).value);
                return true;
            }}
        />
    );
};

TimezoneDropdown.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object
};
