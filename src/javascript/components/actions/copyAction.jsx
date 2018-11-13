import React from "react";
import Node from '../copyPaste/node';
import {copy} from '../copyPaste/redux/actions'
import {composeActions} from "@jahia/react-material";
import {reduxAction} from "./reduxAction";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, reduxAction(() => ({}), (dispatch) => ({copy: n => dispatch(copy(n))})), {
    init: (context) => {
        context.initRequirements({
            requiredPermission: "jcr:addChildNodes",
        });
    },

    onClick: (context) => {

        // todo cut : + requiredPermission: "jcr:removeNode"

        const {copy, path, node:{uuid, nodeName, displayName, primaryNodeType}} = context;
        copy([new Node(path, uuid, nodeName, displayName, primaryNodeType, context.actionKey === "cut" ? Node.PASTE_MODES.MOVE : Node.PASTE_MODES.COPY)]);
    }
});
