import * as _ from 'lodash';
import Node from '../../copyPaste/node';
import pasteMutations from './pasteAction.gql-mutations';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';
import {clear} from '../../copyPaste/redux/actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {reduxAction} from '../reduxAction';
import {filter, map, switchMap} from 'rxjs/operators';
import {withNotificationContextAction} from '../withNotificationContextAction';
import {withI18nAction} from '../withI18nAction';
import {ContentTypesQuery} from '../../gqlQueries';
import {from, of} from 'rxjs';
import {isDescendantOrSelf, getNewNodePath} from '../../ContentManager.utils';
import {cmClosePaths, cmGoto, cmOpenPaths, cmSetSelection, cmAddPathsToRefetch} from '../../redux/actions';

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    state => ({...state.copyPaste, treePath: state.path, openedPaths: state.openPaths, selection: state.selection}),
    dispatch => ({
        clear: () => dispatch(clear()),
        setPath: (path, params) => dispatch(cmGoto({path, params})),
        setSelection: selection => dispatch(cmSetSelection(selection)),
        openPaths: paths => dispatch(cmOpenPaths(paths)),
        closePaths: paths => dispatch(cmClosePaths(paths)),
        addPathsToRefetch: paths => dispatch(cmAddPathsToRefetch(paths))
    })
), {

    init: context => {
        let contentType;
        if (context.items.length > 0) {
            const nodeToPaste = context.items[0];
            contentType = nodeToPaste.primaryNodeType.name;
        }
        context.initRequirements({

            requiredPermission: 'jcr:addChildNodes',
            contentType: contentType,
            getContributeTypesRestrictions: true,

            enabled: context => {
                return context.node.pipe(switchMap(targetNode => {
                    if (context.items.length === 0) {
                        return of(false);
                    }

                    let nodeToPaste = context.items[0];
                    if (nodeToPaste.mutationToUse === Node.PASTE_MODES.MOVE && nodeToPaste.path === targetNode.path + '/' + nodeToPaste.name) {
                        return of(false);
                    }
                    if (isDescendantOrSelf(targetNode.path, nodeToPaste.path)) {
                        return of(false);
                    }

                    const primaryNodeTypeToPaste = nodeToPaste.primaryNodeType;
                    let contributeTypesProperty = targetNode.contributeTypes ||
                        (targetNode.ancestors && !_.isEmpty(targetNode.ancestors) && targetNode.ancestors[targetNode.ancestors.length - 1].contributeTypes);
                    if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                        // Contribute type is not empty so we need to execute a query to know the types that are allowed here
                        return from(context.client.watchQuery({
                            query: ContentTypesQuery,
                            variables: {nodeTypes: contributeTypesProperty.values}
                        })).pipe(
                            filter(res => (res.data)),
                            map(res => {
                                let allowedNodeTypes = [];
                                let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                                _.each(contributionNodeTypes, entry => {
                                    if (entry.supertypes && !_.isEmpty(entry.supertypes)) {
                                        allowedNodeTypes = _.union(allowedNodeTypes, _.map(entry.supertypes, subEntry => {
                                            return subEntry.name;
                                        }));
                                    }
                                    allowedNodeTypes.push(entry.name);
                                });
                                return allowedNodeTypes.indexOf(primaryNodeTypeToPaste.name) !== -1;
                            })
                        );
                    }
                    return of(true);
                }));
            }
        });
    },

    onClick: context => {
        const nodeToPaste = context.items[0];
        const oldPath = nodeToPaste.path;

        // Execute paste
        context.client.mutate({
            variables: {
                pathOrId: oldPath,
                destParentPathOrId: context.path,
                destName: nodeToPaste.name
            },
            mutation: nodeToPaste.mutationToUse === Node.PASTE_MODES.MOVE ? pasteMutations.moveNode : pasteMutations.pasteNode
        }).then(({data}) => {
            context.clear();
            context.notificationContext.notify(context.t('label.contentManager.copyPaste.success'), ['closeButton']);

            // Let's make sure the content table will be refreshed when displayed
            context.addPathsToRefetch([context.path, oldPath.substring(0, oldPath.lastIndexOf('/'))]);

            // If it's a move we need to update the list of opened path with the new paths, update the tree path and update the selection
            if (nodeToPaste.mutationToUse === Node.PASTE_MODES.MOVE) {
                const newPath = data.jcr.pasteNode.node.path;
                const pathsToClose = _.filter(context.openedPaths, openedPath => isDescendantOrSelf(openedPath, oldPath));
                if (!_.isEmpty(pathsToClose)) {
                    context.closePaths(pathsToClose);
                    const pathsToReopen = _.map(pathsToClose, pathToReopen => getNewNodePath(pathToReopen, oldPath, newPath));
                    if (pathsToReopen.indexOf(context.path) === -1) {
                        pathsToReopen.push(context.path);
                    }
                    context.openPaths(pathsToReopen);
                }

                if (context.treePath === oldPath) {
                    context.setPath(newPath);
                }

                if (context.selection === oldPath) {
                    context.setSelection(undefined);
                }
            }

            refetchContentTreeAndListData();
        }, error => {
            console.error(error);
            context.clear();
            context.notificationContext.notify(context.t('label.contentManager.copyPaste.error'), ['closeButton']);
            refetchContentTreeAndListData();
        });
    }
});
