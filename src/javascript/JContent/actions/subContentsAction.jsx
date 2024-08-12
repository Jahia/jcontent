import {cmGoto, cmOpenPaths} from '../redux/JContent.redux';
import {cmSetPreviewSelection} from '../redux/preview.redux';
import JContentConstants from '../JContent.constants';
import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {expandTree} from '~/JContent/JContent.utils';
import {isInSearchMode} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';

export const SubContentsActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {mode, viewMode} = useSelector(state => ({
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode
    }));

    const subNodesType = ['jnt:file', 'jnt:folder', 'jnt:content', 'jnt:contentFolder'];
    const res = useNodeChecks({path}, {
        getSubNodesCount: subNodesType,
        getPrimaryNodeType: true,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:category']
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isContainerType = ['jnt:page', 'jnt:folder', 'jnt:contentFolder'].includes(res?.node?.primaryNodeType?.name);
    const hasSubNodes = subNodesType.some(type => (res?.node[`subNodesCount_${type}`] || 0) > 0);
    const isPageBuilderView = viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER;

    const isVisible = res.checksResult && !isInSearchMode(mode) && (isContainerType || (hasSubNodes && !isPageBuilderView));
    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                expandTree({path}, client).then(({mode, ancestorPaths}) => {
                    dispatch(cmGoto({mode, path, params: {sub: !['jnt:page', 'jnt:contentFolder'].includes(res?.node?.primaryNodeType?.name)}}));
                    dispatch(cmOpenPaths(ancestorPaths));
                    dispatch(cmSetPreviewSelection(path));
                });
            }}
        />
    );
};

SubContentsActionComponent.propTypes = {
    path: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
