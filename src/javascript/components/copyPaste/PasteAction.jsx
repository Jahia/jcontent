import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import NodesInfo from './nodesInfo';
import Node from './node';
import { pasteNode, moveNode } from "./gqlMutations";
import {Mutation} from 'react-apollo';
import {refetchContentTreeAndListData} from '../refetches';

class PasteAction extends React.Component {

    render() {

        let {children, baseContentType, context, t, labelKey, notificationContext, ...rest} = this.props;

        if (NodesInfo.getNodes().length === 0) {
            return null;
        }

        const node = NodesInfo.getNodes()[0];
        const allowedChildren = context.node.allowedChildNodeTypes;

        if (!this.pasteAllowed(allowedChildren, baseContentType, node.primaryNodeType)) {
            return null;
        }

        if (node.mutationToUse === Node.PASTE_MODES.MOVE) {
            return (
                <Mutation
                    mutation={moveNode}>
                    {(moveNode) => {
                        return children({
                            ...rest,
                            labelKey: labelKey,
                            onClick: () => {
                                moveNode({variables: {
                                        pathOrId: node.path,
                                        destParentPathOrId: context.path,
                                        destName: node.displayName
                                    }}).then(() => {
                                    notificationContext.notify(`Pasted`);
                                    refetchContentTreeAndListData();
                                })
                            }
                        });
                    }}
                </Mutation>
            )
        }

        return (
            <Mutation
                mutation={pasteNode}>
                {(pasteNode) => {
                    return children({
                        ...rest,
                        labelKey: labelKey,
                        onClick: () => {
                            pasteNode({variables: {
                                    pathOrId: node.path,
                                    destParentPathOrId: context.path,
                                    destName: node.displayName
                                }}).then(() => {
                                    notificationContext.notify(`Pasted`);
                                    refetchContentTreeAndListData();
                            })
                        }
                    });
                }}
            </Mutation>
        )
    }

    pasteAllowed(allowedTypes, baseChildType, pastedType) {
        if (baseChildType === pastedType) {
            return true;
        }

        return allowedTypes.find((entry) => {
            if (entry.supertypes.find((e) => { return e.name === pastedType})) {
                return true;
            }
            return entry.name === pastedType;
        });

    }
}


PasteAction = _.flowRight(
    withNotifications(),
    translate()
)(PasteAction);

export default PasteAction;
