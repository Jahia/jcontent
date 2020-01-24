import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {map} from 'rxjs/operators';
import gql from 'graphql-tag';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            getLockInfo: true,
            requiredPermission: 'jcr:lockManagement',
            enabled: context => context.node.pipe(map(node => node.operationsSupport.lock && node.lockTypes === null))
        });
    },
    onClick: context => {
        context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: gql`mutation lockNode($pathOrId: String!) {
                jcr {
                    mutateNode(pathOrId: $pathOrId) {
                        lock
                    }
                }
            }`,
            refetchQueries: [
                {
                    query: context.requirementQueryHandler.getQuery(),
                    variables: context.requirementQueryHandler.getVariables()
                }
            ]
        });
    }
});
