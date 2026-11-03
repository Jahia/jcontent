import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {cmGoto, cmOpenPaths, setTableViewMode} from '~/JContent/redux/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {batchActions} from 'redux-batched-actions';
import {
    expandTree,
    hasOwnTemplate,
    isPageBuilderContent,
    isPageBuilderEnabled,
    isPageBuilderNode,
    pageBuilderNodeInfoOptions,
    setPageBuilderContentViewMode,
    toPageBuilderNode
} from '~/JContent/JContent.utils';
import {useApolloClient} from '@apollo/client';

const displayableNodeFolderFragment = {
    applyFor: 'node',
    gql: gql`fragment DisplayableNodeFolder on JCRNode {
        displayableNode {
            isFolder: isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
        }
    }`
};

// A content laid out in a page is edited in that page; only a content with no page opens on its own, through the
// content-template wrapper
export const getPageBuilderPath = node => {
    const {displayableNode} = node;
    return (!hasOwnTemplate(node) && displayableNode && !displayableNode.isFolder) ? displayableNode.path : node.path;
};

export const OpenInPageBuilderActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {mode, viewMode} = useSelector(state => ({mode: state.jcontent.mode, viewMode: state.jcontent.tableView.viewMode}), shallowEqual);
    const isSearch = (mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH);
    const isPageBuilderMode = (viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER);

    // The mixins are supertype-inherited (pages, main resources), so they never appear in the
    // prefetched node's mixinTypes — the fast-path can't decide them, defer to useNodeChecks.
    const res = useNodeChecks(isPageBuilderMode ? {} : {path}, {
        skip: isPageBuilderMode,
        ...pageBuilderNodeInfoOptions,
        // A page opens in the Page Builder from the pages accordion, not through this action
        hideOnNodeTypes: ['jnt:page'],
        applyFragment: displayableNodeFolderFragment
    });
    if (res.loading && Loading) {
        return <Loading {...others}/>;
    }

    if (isPageBuilderMode || !res.node) {
        return (<Render {...others} isVisible={false}/>);
    }

    const node = toPageBuilderNode(res.node);
    const isOpenable = isPageBuilderEnabled() && res.checksResult && isPageBuilderNode(node);
    const targetPath = isOpenable ? getPageBuilderPath(node) : path;

    return (
        <Render {...others}
                isVisible={isOpenable}
                enabled={isOpenable}
                onClick={() => {
                    // Asking for the Page Builder on such an item is a choice of view for the next ones
                    if (targetPath === path && isPageBuilderContent(node)) {
                        setPageBuilderContentViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER);
                    }

                    if (isSearch) {
                        expandTree({path: targetPath}, client).then(({mode, ancestorPaths, site}) => {
                            dispatch(batchActions([
                                cmGoto({mode: mode, path: targetPath, site}),
                                setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER),
                                cmOpenPaths(ancestorPaths)
                            ]));
                        });
                    } else {
                        dispatch(batchActions([
                            cmGoto({path: targetPath}),
                            setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER)
                        ]));
                    }
                }}
        />
    );
};

OpenInPageBuilderActionComponent.propTypes = {
    path: PropTypes.string.isRequired,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
