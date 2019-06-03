import * as _ from 'lodash';
import CopyPasteNode from '../CopyPasteNode';
import pasteMutations from './pasteAction.gql-mutations';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';
import {clear} from '../actions.redux-actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {reduxAction} from '../reduxAction';
import {filter, map, switchMap} from 'rxjs/operators';
import {withNotificationContextAction} from '../withNotificationContextAction';
import {withI18nAction} from '../withI18nAction';
import {ContentTypesQuery} from '../actions.gql-queries';
import {from, of} from 'rxjs';
import {isDescendantOrSelf, getNewNodePath} from '../../ContentManager.utils';
import {cmClosePaths, cmGoto, cmOpenPaths, cmAddPathsToRefetch} from '../../ContentManager.redux-actions';
import {cmSetPreviewSelection} from '../../preview.redux-actions';

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    state => ({
        ...state.copyPaste,
        treePath: state.path,
        openedPaths: state.openPaths,
        previewSelection: state.previewSelection
    }),
    dispatch => ({
        clear: () => dispatch(clear()),
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
            contentTypes: _.uniq(context.items.map(n => n.primaryNodeType.name)),
            getContributeTypesRestrictions: true,

            enabled: context => {
                return context.node.pipe(switchMap(targetNode => {
                    if (context.items.length === 0) {
                        return of(false);
                    }

                    let nodesToPaste = context.items;
                    if (nodesToPaste.reduce((acc, nodeToPaste) => acc ||
                        (nodeToPaste.mutationToUse === CopyPasteNode.PASTE_MODES.MOVE && nodeToPaste.path === targetNode.path + '/' + nodeToPaste.name) ||
                        (isDescendantOrSelf(targetNode.path, nodeToPaste.path)), false)) {
                        return of(false);
                    }

                    const primaryNodeTypesToPaste = _.uniq(nodesToPaste.map(n => n.primaryNodeType.name));
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
    },

    onClick: context => {
        const nodesToPaste = context.items;

        // Execute paste
        Promise.all(nodesToPaste.map(nodeToPaste => context.client.mutate({
            variables: {
                pathOrId: nodeToPaste.path,
                destParentPathOrId: context.path,
                destName: nodeToPaste.name
            },
            mutation: nodeToPaste.mutationToUse === CopyPasteNode.PASTE_MODES.MOVE ? pasteMutations.moveNode : pasteMutations.pasteNode
        }))).then(datas => {
            context.clear();
            context.notificationContext.notify(context.t('label.contentManager.copyPaste.success'), ['closeButton']);

            // Let's make sure the content table will be refreshed when displayed
            context.addPathsToRefetch([context.path, ...nodesToPaste.map(nodeToPaste => nodeToPaste.path.substring(0, nodeToPaste.path.lastIndexOf('/')))]);

            // If it's a move we need to update the list of opened path with the new paths, update the tree path and update the preview selection
            let pastedNodes = _.merge(nodesToPaste, datas.map(({data}) => ({newPath: data.jcr.pasteNode.node.path})));

            const pathsToClose = context.openedPaths.filter(openedPath => pastedNodes.reduce((acc, pastedNode) => acc || (pastedNode.mutationToUse === CopyPasteNode.PASTE_MODES.MOVE && isDescendantOrSelf(openedPath, pastedNode.path)), false));
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
            context.notificationContext.notify(context.t('label.contentManager.copyPaste.error'), ['closeButton']);
            refetchContentTreeAndListData();
        });
    }
});
