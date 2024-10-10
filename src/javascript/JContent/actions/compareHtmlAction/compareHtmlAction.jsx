import React from 'react';
import PropTypes from 'prop-types';
import {createEncodedHashString} from '../../CompareDialog/util';

export const CompareHtmlActionComponent = ({path, render: Render, ...others}) => {
    return (
        <Render
            {...others}
            onClick={() => {
                window.open(`${window.location.href}#${createEncodedHashString(path)}`, '_blank');
            }}
        />
    );
};

CompareHtmlActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired
};
