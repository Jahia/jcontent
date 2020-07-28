import React from 'react';
import {CM_DRAWER_STATES} from '../JContent.redux';
import {cmSetPreviewSelection, cmSetPreviewState} from '../preview.redux';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const PreviewActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const dispatch = useDispatch();

    const res = useNodeChecks(
        {path},
        {
            hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder', 'jnt:virtualsite', 'jnt:navMenuText']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            enabled={res.checksResult}
            onClick={() => {
                dispatch(cmSetPreviewSelection(path));
                dispatch(cmSetPreviewState(CM_DRAWER_STATES.SHOW));
            }}
        />
    );
};

PreviewActionComponent.propTypes = {
    path: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
