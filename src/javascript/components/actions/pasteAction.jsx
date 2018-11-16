import React from "react";
import * as _ from "lodash";
import Node from '../copyPaste/node';
import { pasteNode, moveNode } from "../copyPaste/gqlMutations";
import {refetchContentTreeAndListData} from '../refetches';
import {clear} from "../copyPaste/redux/actions";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {reduxAction} from "./reduxAction";
import {map} from "rxjs/operators";
import { withNotificationContextAction } from "./withNotificationContextAction";
import { withI18nAction } from "./withI18nAction";

function filterByBaseType(types, baseTypeName) {
    return _.filter(types, type => {
        let superTypes = _.map(type.supertypes, superType => superType.name);
        return _.includes(superTypes, baseTypeName);
    });
}

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    (state) => ({...state.copyPaste, currentlySelectedPath: state.path}),
    (dispatch) => ({
        clear: () => dispatch(clear())
    })
), {
    init: (context, props) => {
        let baseContentType = 'jmix:editorialContent';
        if (context.items.length > 0) {
            const nodeToPaste = context.items[0];
            if (nodeToPaste.primaryNodeType.name === 'jnt:file'
                || nodeToPaste.primaryNodeType.name === 'jnt:folder'
                || nodeToPaste.primaryNodeType.name === 'jnt:contentFolder') {
                baseContentType = nodeToPaste.primaryNodeType.name;
            }
        }
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            baseContentType: baseContentType,
            enabled: context => {
                return context.node.pipe(map(targetNode => {
                    if (context.items.length === 0) {
                        return false;
                    }

                    const primaryNodeTypeToPaste = context.items[0].primaryNodeType;
                    let contributeTypesProperty = targetNode.contributeTypes;
                    if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                        return contributeTypesProperty.values.indexOf(primaryNodeTypeToPaste.name) !== -1;
                    } else {
                        let childNodeTypes = _.union(filterByBaseType(targetNode.allowedChildNodeTypes, baseContentType),
                            filterByBaseType(targetNode.subTypes, baseContentType));
                        let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);

                        return childNodeTypeNames.indexOf(primaryNodeTypeToPaste.name) !== -1;
                    }
                }))
            }
        });
    },
    onClick: (context) => {
        const nodeToPaste = context.items[0];
        if (nodeToPaste.mutationToUse === Node.PASTE_MODES.MOVE) {
            context.client.mutate({
                variables: {
                    pathOrId: nodeToPaste.path,
                    destParentPathOrId: context.path,
                    destName: nodeToPaste.displayName
                },
                mutation: moveNode,
                refetchQueries: [{
                    query : context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables(),
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
                mutation: pasteNode,
                refetchQueries: [{
                    query : context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables(),
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
