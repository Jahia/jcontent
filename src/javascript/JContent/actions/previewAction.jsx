import React from 'react';
import {CM_DRAWER_STATES} from '../JContent.redux';
import {cmSetPreviewSelection, cmSetPreviewState} from '../preview.redux';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const PreviewActionComponent = ({context, render: Render, loading: Loading}) => {
    const dispatch = useDispatch();

    const res = useNodeChecks(
        {path: context.path},
        {
            hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder', 'jnt:virtualsite']
        }
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    return (
        <Render context={{
            ...context,
            isVisible: res.checksResult,
            enabled: res.checksResult,
            onClick: () => {
                dispatch(cmSetPreviewSelection(context.path));
                dispatch(cmSetPreviewState(CM_DRAWER_STATES.SHOW));
            }
        }}/>
    );
};

PreviewActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
