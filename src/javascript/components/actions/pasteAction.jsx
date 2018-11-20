import * as _ from 'lodash';
import Node from '../copyPaste/node';
import {pasteMutations} from '../gqlMutations';
import {refetchContentTreeAndListData} from '../refetches';
import {clear} from '../copyPaste/redux/actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {filter, map, switchMap} from 'rxjs/operators';
import {withNotificationContextAction} from './withNotificationContextAction';
import {withI18nAction} from './withI18nAction';
import {ContentTypesQuery} from '../gqlQueries';
import {from, of} from 'rxjs';
import {first} from 'rxjs/operators';

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    state => ({...state.copyPaste, currentlySelectedPath: state.path}),
    dispatch => ({
        clear: () => dispatch(clear())
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

                    const primaryNodeTypeToPaste = context.items[0].primaryNodeType;
                    let contributeTypesProperty = targetNode.contributeTypes ||
                                                    targetNode.ancestors && !_.isEmpty(targetNode.ancestors) && targetNode.ancestors[targetNode.ancestors.length - 1].contributeTypes;
                    if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                        // Contribute type is not empty so we need to execute a query to know the types that are allowed here
                        return from(context.client.watchQuery({query: ContentTypesQuery, variables: {nodeTypes: contributeTypesProperty.values}})).pipe(
                            filter(res => (res.data)),
                            first(),
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
        if (nodeToPaste.mutationToUse === Node.PASTE_MODES.MOVE) {
            context.client.mutate({
                variables: {
                    pathOrId: nodeToPaste.path,
                    destParentPathOrId: context.path,
                    destName: nodeToPaste.displayName
                },
                mutation: pasteMutations.moveNode,
                refetchQueries: [{
                    query: context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables()
                }]
            }).then(() => {
                context.clear();
                context.notificationContext.notify(
                    context.t('label.contentManager.copyPaste.success'),
                    ['closeButton']
                );
                refetchContentTreeAndListData();
            }, error => {
                console.error(error);
                context.clear();
                context.notificationContext.notify(
                    context.t('label.contentManager.copyPaste.error'),
                    ['closeButton']
                );
                refetchContentTreeAndListData();
            });
        } else {
            context.client.mutate({
                variables: {
                    pathOrId: nodeToPaste.path,
                    destParentPathOrId: context.path,
                    destName: nodeToPaste.displayName
                },
                mutation: pasteMutations.pasteNode,
                refetchQueries: [{
                    query: context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables()
                }]
            }).then(() => {
                context.clear();
                context.notificationContext.notify(
                    context.t('label.contentManager.copyPaste.success'),
                    ['closeButton']
                );
                refetchContentTreeAndListData();
            }, error => {
                console.error(error);
                context.clear();
                context.notificationContext.notify(
                    context.t('label.contentManager.copyPaste.error'),
                    ['closeButton']
                );
                refetchContentTreeAndListData();
            });
        }
    }
});
