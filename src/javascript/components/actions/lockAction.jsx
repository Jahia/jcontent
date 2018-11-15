import React from 'react';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {map} from "rxjs/operators";
import {lockMutations} from "../gqlMutations";

export default composeActions(requirementsAction, {
  init:(context) => {
    context.initRequirements({
        getLockInfo: true,
        requiredPermission: "jcr:lockManagement",
        enabled: (context) => context.node.pipe(map(node => node.lockTypes === null))
    });
  },
  onClick:(context) => {
      context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: lockMutations.lock,
            refetchQueries: [
                {
                    query : context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables(),
                }]
      });
  }
});
