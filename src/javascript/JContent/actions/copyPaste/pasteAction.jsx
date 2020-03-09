import * as _ from 'lodash';
import pasteMutations from './copyPaste.gql-mutations';
import {refetchContentTreeAndListData} from '../../JContent.refetches';
import {copypasteClear} from './copyPaste.redux';
import {composeActions} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {reduxAction} from '../reduxAction';
import {filter, map, switchMap} from 'rxjs/operators';
import {withNotificationContextAction} from '../withNotificationContextAction';
import {withI18nAction} from '../withI18nAction';
import {ContentTypesQuery} from '../actions.gql-queries';
import {from, of} from 'rxjs';
import {isDescendantOrSelf, getNewNodePath} from '../../JContent.utils';
import {cmClosePaths, cmGoto, cmOpenPaths, cmAddPathsToRefetch} from '../../JContent.redux';
import {cmSetPreviewSelection} from '../../preview.redux';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    state => ({
        copyPaste: state.jcontent.copyPaste,
        treePath: state.jcontent.path,
        openedPaths: state.jcontent.openPaths,
        previewSelection: state.jcontent.previewSelection
    }),
    dispatch => ({
        clear: () => dispatch(copypasteClear()),
        setPath: (path, params) => dispatch(cmGoto({path, params})),
        setPreviewSelection: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
        openPaths: paths => dispatch(cmOpenPaths(paths)),
        closePaths: paths => dispatch(cmClosePaths(paths)),
        addPathsToRefetch: paths => dispatch(cmAddPathsToRefetch(paths))
    })
), {

    init: context => {
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            contentTypes: _.uniq(context.copyPaste.nodes.map(n => n.primaryNodeType.name)),
            getContributeTypesRestrictions: true,

            enabled: context => {
                return context.node.pipe(switchMap(targetNode => {
                    const {nodes, type} = context.copyPaste;

                    if (nodes.length === 0) {
                        return of(false);
                    }

                    if (nodes.reduce((acc, nodeToPaste) => acc ||
                        (type === copyPasteConstants.CUT && nodeToPaste.path === targetNode.path + '/' + nodeToPaste.name) ||
                        (isDescendantOrSelf(targetNode.path, nodeToPaste.path)), false)) {
                        return of(false);
                    }

                    const primaryNodeTypesToPaste = _.uniq(nodes.map(n => n.primaryNodeType.name));
                    let contributeTypesProperty = targetNode.contributeTypes ||
                        (targetNode.ancestors && targetNode.ancestors.length > 0 && targetNode.ancestors[targetNode.ancestors.length - 1].contributeTypes);
                    if (contributeTypesProperty && contributeTypesProperty.values.length > 0) {
                        // Contribute type is not empty so we need to execute a query to know the types that are allowed here
                        return from(context.client.query({
                            query: ContentTypesQuery,
                            variables: {nodeTypes: contributeTypesProperty.values}
                        })).pipe(
                            filter(res => (res.data)),
                            map(res => {
                                let allowedNodeTypes = [];
                                let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                                contributionNodeTypes.forEach(entry => {
                                    if (entry.supertypes && entry.supertypes.length > 0) {
                                        allowedNodeTypes = _.union(allowedNodeTypes, entry.supertypes.map(subEntry => {
                                            return subEntry.name;
                                        }));
                                    }

                                    allowedNodeTypes.push(entry.name);
                                });
                                return _.difference(primaryNodeTypesToPaste, allowedNodeTypes).length === 0;
                            })
                        );
                    }

                    return of(true);
                }));
            }
        });
        context.isVisible = true;
    },

    onClick: context => {
        const {nodes, type} = context.copyPaste;

        const mutation = type === copyPasteConstants.CUT ? pasteMutations.moveNode : pasteMutations.pasteNode;

        // Execute paste
        Promise.all(nodes.map(nodeToPaste => context.client.mutate({
            variables: {
                pathOrId: nodeToPaste.path,
                destParentPathOrId: context.path,
                destName: nodeToPaste.name
            },
            mutation
        }))).then(datas => {
            context.clear();
            setLocalStorage(copyPasteConstants.COPY, [], context.client);
            context.notificationContext.notify(context.t('jcontent:label.contentManager.copyPaste.success'), ['closeButton']);

            // Let's make sure the content table will be refreshed when displayed
            context.addPathsToRefetch([context.path, ...nodes.map(nodeToPaste => nodeToPaste.path.substring(0, nodeToPaste.path.lastIndexOf('/')))]);

            // If it's a move we need to update the list of opened path with the new paths, update the tree path and update the preview selection
            let pastedNodes = _.merge(nodes, datas.map(({data}) => ({newPath: data.jcr.pasteNode.node.path})));

            const pathsToClose = context.openedPaths.filter(openedPath => pastedNodes.reduce((acc, pastedNode) => acc || (type === copyPasteConstants.CUT && isDescendantOrSelf(openedPath, pastedNode.path)), false));
            if (pathsToClose.length > 0) {
                context.closePaths(pathsToClose);
                const pathsToReopen = pathsToClose.map(pathToReopen => pastedNodes.reduce((acc, pastedNode) => getNewNodePath(acc, pastedNode.path, pastedNode.newPath), pathToReopen));
                if (pathsToReopen.indexOf(context.path) === -1) {
                    pathsToReopen.push(context.path);
                }

                context.openPaths(pathsToReopen);
            }

            pastedNodes.forEach(pastedNode => {
                if (pastedNode.path === context.treePath) {
                    context.setPath(pastedNode.newPath, {sub: false});
                }

                if (pastedNode.path === context.previewSelection) {
                    context.setPreviewSelection(null);
                }
            });

            refetchContentTreeAndListData();
        }, error => {
            console.error(error);
            context.clear();
            context.notificationContext.notify(context.t('jcontent:label.contentManager.copyPaste.error'), ['closeButton']);
            refetchContentTreeAndListData();
        });
    }
});
