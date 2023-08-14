import React from 'react';
import {CM_DRAWER_STATES} from '../redux/JContent.redux';
import {cmSetPreviewSelection, cmSetPreviewState} from '../redux/preview.redux';
import {useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import JContentConstants from '~/JContent/JContent.constants';

export const PreviewActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const dispatch = useDispatch();
    const viewMode = useSelector(state => state.jcontent.tableView?.viewMode);

    const res = useNodeChecks(
        {path},
        {
            hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder', 'jnt:virtualsite', 'jnt:navMenuText', 'jnt:category']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult && viewMode !== JContentConstants.tableView.viewMode.PAGE_BUILDER}
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
