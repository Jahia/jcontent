import React from 'react';
import {CM_DRAWER_STATES} from '../redux/JContent.redux';
import {cmSetPreviewSelection, cmSetPreviewState} from '../redux/preview.redux';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const PreviewActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const dispatch = useDispatch();

    const res = useNodeChecks(
        {path},
        {
            hideOnNodeTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    function isVisible() {
        // Hide on page, virtualsite and navMenuText no matter what. Allow to render preview if the node extends contentFolder or folder
        return res.checksResult ? !['jnt:contentFolder', 'jnt:folder'].includes(res.node.primaryNodeType?.name) : false;
    }

    return (
        <Render
            {...others}
            isVisible={isVisible()}
            enabled={isVisible()}
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
