import React from 'react';
import PropTypes from 'prop-types';
import {withTheme} from '@material-ui/core';

const ResizingHandleIcon = ({theme}) => (
    <svg width="5" height="23" viewBox="0 0 5 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="4" height="22" rx="0.5" fill={theme.palette.background.paper} stroke={theme.palette.border.main}/>
        <rect x="2" y="3" width="1" height="17" fill={theme.palette.border.main}/>
    </svg>
);

ResizingHandleIcon.propTypes = {
    theme: PropTypes.object.isRequired
};

export default withTheme()(ResizingHandleIcon);
