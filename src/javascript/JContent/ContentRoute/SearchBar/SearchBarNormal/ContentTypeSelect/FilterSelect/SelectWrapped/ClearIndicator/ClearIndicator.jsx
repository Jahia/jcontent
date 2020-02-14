import React from 'react';
import PropTypes from 'prop-types';
import {components} from 'react-select';
import {Close} from '@material-ui/icons';

const ClearIndicator = (props, {selectProps}) => (
    (selectProps && selectProps.open) ?
        <components.ClearIndicator {...props}>
            <Close fontSize="small"/>
        </components.ClearIndicator> :
        <div/>
);

ClearIndicator.propTypes = {
    selectProps: PropTypes.object
};

ClearIndicator.defaultProps = {
    selectProps: {}
};

export default ClearIndicator;
