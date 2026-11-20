import React from 'react';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';

// Records the selection it was clicked with, for the Cypress tests to read back.
export const TestBulkActionComponent = ({path, paths, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks({path, paths}, others);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
                window.jcontentTestBulkActionPaths = paths || [path];
            }}
        />
    );
};

TestBulkActionComponent.propTypes = {
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
