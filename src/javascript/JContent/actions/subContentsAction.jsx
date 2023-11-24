import {cmGoto, cmOpenPaths} from '../redux/JContent.redux';
import {cmSetPreviewSelection} from '../redux/preview.redux';
import JContentConstants from '../JContent.constants';
import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {expandTree} from '~/JContent/JContent.utils';

export const SubContentsActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const mode = useSelector(state => state.jcontent.mode);

    const res = useNodeChecks({path}, {
        getSubNodesCount: ['jnt:file', 'jnt:folder', 'jnt:content', 'jnt:contentFolder'],
        getPrimaryNodeType: true,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:category']
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const totalCount = res.node['subNodesCount_jnt:file'] + res.node['subNodesCount_jnt:folder'] + res.node['subNodesCount_jnt:content'] + res.node['subNodesCount_jnt:contentFolder'];

    const isVisible = res.checksResult && mode !== JContentConstants.mode.SEARCH && mode !== JContentConstants.mode.SQL2SEARCH && (
        (res.node.primaryNodeType.name === 'jnt:page' || res.node.primaryNodeType.name === 'jnt:folder' || res.node.primaryNodeType.name === 'jnt:contentFolder') ||
        (totalCount > 0)
    );

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                expandTree({path}, client).then(({mode, ancestorPaths}) => {
                    dispatch(cmGoto({mode, path, params: {sub: res.node.primaryNodeType.name !== 'jnt:page' && res.node.primaryNodeType.name !== 'jnt:contentFolder'}}));
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
