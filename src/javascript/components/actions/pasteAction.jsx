import React from "react";
import * as _ from "lodash";
import Node from '../copyPaste/node';
import { pasteMutations } from "../gqlMutations";
import {refetchContentTreeAndListData} from '../refetches';
import {clear} from "../copyPaste/redux/actions";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {reduxAction} from "./reduxAction";
import {map} from "rxjs/operators";
import { withNotificationContextAction } from "./withNotificationContextAction";
import { withI18nAction } from "./withI18nAction";

export default composeActions(requirementsAction, withNotificationContextAction, withI18nAction, reduxAction(
    (state) => ({...state.copyPaste, currentlySelectedPath: state.path}),
    (dispatch) => ({
        clear: () => dispatch(clear())
    })
), {
    init: (context) => {
        let contentType;
        if (context.items.length > 0) {
            const nodeToPaste = context.items[0];
            contentType = nodeToPaste.primaryNodeType.name;
        }
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            contentType: contentType,
            enabled: context => {
                return context.node.pipe(map(targetNode => {
                    if (context.items.length === 0) {
                        return false;
                    }

                    const primaryNodeTypeToPaste = context.items[0].primaryNodeType;
                    let contributeTypesProperty = targetNode.contributeTypes;
                    if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                        return contributeTypesProperty.values.indexOf(primaryNodeTypeToPaste.name) !== -1;
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
                mutation: pasteMutations.moveNode,
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
                mutation: pasteMutations.pasteNode,
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
