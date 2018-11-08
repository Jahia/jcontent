import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import Node from '../copyPaste/node';
import { pasteNode, moveNode } from "../copyPaste/gqlMutations";
import {Mutation} from 'react-apollo';
import {refetchContentTreeAndListData} from '../refetches';
import {connect} from "react-redux";
import {clear} from "../copyPaste/redux/actions";
import { cmGoto, cmSetPath } from "../redux/actions";
import { invokeModificationHook } from '../copyPaste/contentModificationHook';

class PasteAction extends React.Component {

    render() {

        let {children, baseContentType, context, t, labelKey, items, notificationContext,
            dispatch, currentlySelectedPath, ...rest} = this.props;

        if (items.length === 0) {
            return null;
        }

        const node = items[0];
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
                                dispatch(clear());
                                //Change selection to target node incase current selection will not be valid anymore
                                if (currentlySelectedPath.indexOf(node.path) !== -1) {
                                    invokeModificationHook([
                                        node.uuid, node.path, node.name, "delete", null
                                    ]);
                                    dispatch(cmSetPath(context.path));
                                    setTimeout(() => {
                                        moveNode({variables: {
                                                pathOrId: node.path,
                                                destParentPathOrId: context.path,
                                                destName: node.displayName
                                            }}).then(() => {
                                            notificationContext.notify(
                                                t("label.contentManager.copyPaste.success"),
                                                ['closeButton']
                                            );
                                            refetchContentTreeAndListData();
                                        })
                                    }, 150);
                                }
                                else {
                                    moveNode({variables: {
                                            pathOrId: node.path,
                                            destParentPathOrId: context.path,
                                            destName: node.displayName
                                        }}).then(() => {
                                        notificationContext.notify(
                                            t("label.contentManager.copyPaste.success"),
                                            ['closeButton']
                                        );
                                        refetchContentTreeAndListData();
                                    })
                                }
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
                            dispatch(clear());
                            pasteNode({variables: {
                                    pathOrId: node.path,
                                    destParentPathOrId: context.path,
                                    destName: node.displayName
                                }}).then(() => {
                                    notificationContext.notify(
                                        t("label.contentManager.copyPaste.success"),
                                        ['closeButton']
                                    );
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
            if (entry.supertypes && entry.supertypes.find((e) => { return e.name === pastedType})) {
                return true;
            }
            return entry.name === pastedType;
        });

    }
}

const mapStateToProps = (state, ownProps) => {
    return { ...state.copyPaste, currentlySelectedPath: state.path }
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch
    }
};

PasteAction = _.flowRight(
    withNotifications(),
    translate(),
    connect(mapStateToProps)
)(PasteAction);

export default {};
