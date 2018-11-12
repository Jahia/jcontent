import React from "react";
import {PredefinedFragments} from "@jahia/apollo-dx";
import {composeActions} from "@jahia/react-material";
import {hasMixin} from "../utils.js";
import requirementsAction from "./requirementsAction";
import {withNodeName} from "./withNodeName";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

export default composeActions(requirementsAction, withNodeName, {
    init:(context) => {
        context.enabled = combineLatest(context.enabled, context.node.pipe(map(node=>
            (context.checkForUnpublication ?
                node.aggregatedPublicationInfo.publicationStatus !== "NOT_PUBLISHED" :
                !hasMixin(node, "jmix:markedForDeletion")) &&
            (!context.checkIfLanguagesMoreThanOne || node.site.languages.length > 1)
        ))).pipe(map(arr=>arr[0] && arr[1]));
    },
    onClick:(context) => window.parent.authoringApi.openPublicationWorkflow([context.node.uuid], context.allSubTree, context.allLanguages, context.checkForUnpublication)
});