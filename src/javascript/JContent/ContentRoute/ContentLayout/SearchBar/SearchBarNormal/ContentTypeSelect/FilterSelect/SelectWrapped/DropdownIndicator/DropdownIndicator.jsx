import React from 'react';
import PropTypes from 'prop-types';
import {components} from 'react-select';
import {ChevronDown} from 'mdi-material-ui';

const DropdownIndicator = (props, {selectProps}) => (
    (selectProps && selectProps.open) ?
        <div/> :
        <components.DropdownIndicator {...props}>
            <ChevronDown fontSize="small"/>
        </components.DropdownIndicator>
);

DropdownIndicator.propTypes = {
    selectProps: PropTypes.object
};

DropdownIndicator.defaultProps = {
    selectProps: {}
};

export default DropdownIndicator;
