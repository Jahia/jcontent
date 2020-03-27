import * as _ from 'lodash';
import pasteMutations from './copyPaste.gql-mutations';
import {triggerRefetchAll} from '../../JContent.refetches';
import {copypasteClear} from './copyPaste.redux';
import {withNotifications} from '@jahia/react-material';
import {getNewNodePath, isDescendantOrSelf} from '../../JContent.utils';
import {cmAddPathsToRefetch, cmClosePaths, cmGoto, cmOpenPaths} from '../../JContent.redux';
import {cmSetPreviewSelection} from '../../preview.redux';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';
import {useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import React from 'react';
import {useApolloClient, useLazyQuery} from '@apollo/react-hooks';
import {useTranslation} from 'react-i18next';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

export const PasteActionComponent = ({context, render: Render, loading: Loading, notificationContext}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const {copyPaste, treePath, openedPaths, previewSelection} = useSelector(state => ({
        copyPaste: state.jcontent.copyPaste,
        treePath: state.jcontent.path,
        openedPaths: state.jcontent.openPaths,
        previewSelection: state.jcontent.previewSelection
    }));

    const res = useNodeChecks(
        {path: context.path},
        {
            requiredPermission: 'jcr:addChildNodes',
            getChildNodeTypes: true,
            getContributeTypesRestrictions: true,
            ...context
        }
    );

    const [loadContentTypes, contentTypesResult] = useLazyQuery(gql`
        query PasteCheckQuery($nodeTypes: [String]!, $contributeTypes:[String]!, $childNodeTypes:[String]!) {
            jcr {
                nodeTypesByNames(names: $nodeTypes) {
                    contributeTypes: isNodeType(type:{multi:ANY, types: $contributeTypes})
                    childNodeTypes: isNodeType(type:{multi:ANY, types: $childNodeTypes})
                }
            }
        }
    `);

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const {nodes, type} = copyPaste;

    let isVisible = res.checksResult;

    if (isVisible && nodes.length === 0) {
        isVisible = false;
    }

    if (isVisible && nodes.reduce((acc, nodeToPaste) => acc ||
        (type === copyPasteConstants.CUT && nodeToPaste.path === res.node.path + '/' + nodeToPaste.name) ||
        (isDescendantOrSelf(res.node.path, nodeToPaste.path)), false)) {
        isVisible = false;
    }

    if (isVisible) {
        const primaryNodeTypesToPaste = _.uniq(nodes.map(n => n.primaryNodeType.name));
        const childNodeTypes = res.node.allowedChildNodeTypes.map(t => t.name);
        const contributeTypesProperty = res.node.contributeTypes ||
            (res.node.ancestors && res.node.ancestors.length > 0 && res.node.ancestors[res.node.ancestors.length - 1].contributeTypes);
        const contributeTypes = contributeTypesProperty ? contributeTypesProperty.values : [];

        const variables = {
            nodeTypes: primaryNodeTypesToPaste,
            childNodeTypes,
            contributeTypes
        };

        let shouldCallQuery = !contentTypesResult.called || !_.isEqual(variables, contentTypesResult.variables);

        if (shouldCallQuery) {
            loadContentTypes({variables});
        }

        if (contentTypesResult.loading || shouldCallQuery) {
            return <Loading context={context}/>;
        }

        isVisible = contentTypesResult.data.jcr.nodeTypesByNames.reduce((acc, val) => {
            return (
                acc &&
                (contributeTypes.length === 0 || val.contributeTypes) &&
                (childNodeTypes.length === 0 || val.childNodeTypes)
            );
        }, true);
    }

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                const mutation = type === copyPasteConstants.CUT ? pasteMutations.moveNode : pasteMutations.pasteNode;

                // Execute paste
                Promise.all(nodes.map(nodeToPaste => client.mutate({
                    variables: {
                        pathOrId: nodeToPaste.path,
                        destParentPathOrId: context.path,
                        destName: nodeToPaste.name
                    },
                    mutation
                }))).then(datas => {
                    dispatch(copypasteClear());
                    setLocalStorage(copyPasteConstants.COPY, [], client);
                    notificationContext.notify(t('jcontent:label.contentManager.copyPaste.success'), ['closeButton']);

                    // Let's make sure the content table will be refreshed when displayed
                    dispatch(cmAddPathsToRefetch([context.path, ...nodes.map(nodeToPaste => nodeToPaste.path.substring(0, nodeToPaste.path.lastIndexOf('/')))]));

                    // If it's a move we need to update the list of opened path with the new paths, update the tree path and update the preview selection
                    let pastedNodes = _.merge(nodes, datas.map(({data}) => ({newPath: data.jcr.pasteNode.node.path})));

                    const pathsToClose = openedPaths.filter(openedPath => pastedNodes.reduce((acc, pastedNode) => acc || (type === copyPasteConstants.CUT && isDescendantOrSelf(openedPath, pastedNode.path)), false));
                    if (pathsToClose.length > 0) {
                        dispatch(cmClosePaths(pathsToClose));
                        const pathsToReopen = pathsToClose.map(pathToReopen => pastedNodes.reduce((acc, pastedNode) => getNewNodePath(acc, pastedNode.path, pastedNode.newPath), pathToReopen));
                        if (pathsToReopen.indexOf(context.path) === -1) {
                            pathsToReopen.push(context.path);
                        }

                        dispatch(cmOpenPaths(pathsToReopen));
                    }

                    pastedNodes.forEach(pastedNode => {
                        if (pastedNode.path === treePath) {
                            dispatch(cmGoto({path: pastedNode.newPath, params: {sub: false}}));
                        }

                        if (pastedNode.path === previewSelection) {
                            dispatch(cmSetPreviewSelection(null));
                        }
                    });

                    triggerRefetchAll();
                }, error => {
                    console.error(error);
                    dispatch(copypasteClear());
                    notificationContext.notify(t('jcontent:label.contentManager.copyPaste.error'), ['closeButton']);
                    triggerRefetchAll();
                });
            }
        }}/>
    );
};

PasteActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func,

    notificationContext: PropTypes.object.isRequired
};

const pasteAction = {
    component: withNotifications()(PasteActionComponent)
};

export default pasteAction;
