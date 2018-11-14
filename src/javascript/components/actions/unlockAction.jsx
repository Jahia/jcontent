import React from 'react';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {map} from "rxjs/operators";
import {hasProperty} from "../utils";
import {lockMutations} from "../gqlQueries";

export default composeActions(requirementsAction, {
    init:(context) => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
            requiredPermission: "jcr:lockManagement",
            enabled: (context) => context.node.pipe(map(node => hasProperty(node, "j:lockTypes")))
        });
    },
    onClick:(context) => {
        context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: lockMutations.unlock,
        });
    }
});
