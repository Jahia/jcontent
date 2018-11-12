import React from "react";
import {hasMixin} from "../utils.js";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, {
    init: (context) => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
        });
        context.enabled = combineLatest(context.enabled, context.node.pipe(map(node => hasMixin(node, "jmix:markedForDeletionRoot"))))
            .pipe(map(arr => arr[0] && arr[1]))
    },
    onClick: (context) => window.parent.authoringApi.openPublicationWorkflow([context.node.uuid], true, false, false)
});