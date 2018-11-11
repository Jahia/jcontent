import React from "react";
import {hasMixin} from "../utils.js";
import {combineLatest} from "rxjs";
import {map} from 'rxjs/operators';
import {ellipsizeText} from "../utils.js";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, {
    init: (context) => {
        context.enabled = combineLatest(context.enabled, context.node.pipe(map(node => hasMixin(node, "jmix:markedForDeletionRoot"))))
            .pipe(map(arr => arr[0] && arr[1]))
    },
    onClick: (context) => window.parent.authoringApi.undeleteContent(context.uuid, context.node.path, (context.node.displayName ? ellipsizeText(context.displayName, 100) : ""), context.node.name)
});
