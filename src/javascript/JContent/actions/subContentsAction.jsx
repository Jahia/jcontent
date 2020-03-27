import {expandTree} from './expandTree';
import {cmGoto, cmOpenPaths} from '../JContent.redux';
import {cmSetPreviewSelection} from '../preview.redux';
import JContentConstants from '../JContent.constants';
import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/react-hooks';
import {useDispatch, useSelector} from 'react-redux';

export const SubContentsActionComponent = ({context, render: Render, loading: Loading}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const mode = useSelector(state => state.jcontent.mode);

    const res = useNodeChecks({path: context.path}, {
        getSubNodesCount: {
            types: ['jnt:file', 'jnt:folder', 'jnt:content', 'jnt:contentFolder']
        },
        getPrimaryNodeType: true,
        ...context
    });

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult && mode !== JContentConstants.mode.SEARCH && mode !== JContentConstants.mode.SQL2SEARCH && (
        (res.node.primaryNodeType.name === 'jnt:page' || res.node.primaryNodeType.name === 'jnt:folder' || res.node.primaryNodeType.name === 'jnt:contentFolder') ||
        (res.node.subNodes.pageInfo.totalCount > 0)
    );

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                expandTree(context.path, client).then(({mode, ancestorPaths}) => {
                    dispatch(cmGoto({mode: mode, path: context.path, params: {sub: res.node.primaryNodeType.name !== 'jnt:page' && res.node.primaryNodeType.name !== 'jnt:contentFolder'}}));
                    dispatch(cmOpenPaths(ancestorPaths));
                    dispatch(cmSetPreviewSelection(context.path));
                });
            }
        }}/>
    );
};

SubContentsActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

const subContentsAction = {
    component: SubContentsActionComponent
};

export default subContentsAction;
