import React from "react";
import {hasMixin} from "../utils.js";
import {combineLatest} from "rxjs";
import {map} from 'rxjs/operators';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, {
    init: (context) => {
        context.enabled = combineLatest(context.enabled, context.node.pipe(map(node=> !hasMixin(node, "jmix:markedForDeletion"))))
            .pipe(map(arr=>arr[0] && arr[1]))
    },
    onClick: (context) => window.parent.authoringApi.deleteContent(context.uuid, context.node.path, context.node.displayName, ["jnt:content"], ["nt:base"], false, false)
});
