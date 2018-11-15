import React from 'react';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {map} from "rxjs/operators";
import {lockMutations} from "../gqlMutations";
import * as _ from 'lodash';
import {withDxContextAction} from "./withDxContextAction";

export default composeActions(requirementsAction, withDxContextAction, {
    init:(context) => {
        context.initRequirements({
            retrieveLockInfo: context.language,
            requiredPermission: "jcr:lockManagement",
            enabled: (context) => context.node.pipe(map(node => node.lockTypes !== null && !_.includes(node.lockTypes.values, " deletion :deletion")
                && context.dxContext.userName === 'root'))
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
