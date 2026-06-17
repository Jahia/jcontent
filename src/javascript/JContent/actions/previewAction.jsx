import React from 'react';
import {cmSetSidePanelSelection} from '../redux/preview.redux';
import {useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import JContentConstants from '~/JContent/JContent.constants';
import {isDefinitelyHidden} from './utils/nodeVisibilityUtils';

export const PreviewActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const dispatch = useDispatch();
    const viewMode = useSelector(state => state.jcontent.tableView?.viewMode);
    const hideOnNodeTypes = ['jnt:page', 'jnt:folder', 'jnt:contentFolder', 'jnt:virtualsite', 'jnt:navMenuText', 'jnt:category'];

    const isPageBuilderMode = viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER;
    const skip = isPageBuilderMode || isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes});

    const res = useNodeChecks(
        {path},
        {
            skip,
            hideOnNodeTypes
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult && viewMode !== JContentConstants.tableView.viewMode.PAGE_BUILDER}
            enabled={res.checksResult}
            onClick={() => {
                dispatch(cmSetSidePanelSelection(path));
            }}
        />
    );
};

PreviewActionComponent.propTypes = {
    path: PropTypes.string,

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
