import React from 'react';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {map} from "rxjs/operators";
import {hasProperty} from "../utils";
import {lockMutations} from "../gqlMutations";
import {withDxContextAction} from "./withDxContextAction";

export default composeActions(requirementsAction, withDxContextAction, {
    init:(context) => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
            requiredPermission: "jcr:lockManagement",
            enabled: (context) => context.node.pipe(map(node => hasProperty(node, "j:lockTypes") && context.dxContext.userName === 'root'))
        });
    },
    onClick:(context) => {
        context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: lockMutations.clearAllLocks,
            refetchQueries: [
                {
                    query : context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables(),
                }]
        });
    }
});
