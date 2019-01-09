import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {map} from 'rxjs/operators';
import * as _ from 'lodash';
import gql from 'graphql-tag';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            getLockInfo: true,
            requiredPermission: 'jcr:lockManagement',
            enabled: context => context.node.pipe(map(node => node.lockTypes !== null && !_.includes(node.lockTypes.values, ' deletion :deletion')))
        });
    },
    onClick: context => {
        context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: gql`mutation unlockNode($pathOrId: String!) {
                jcr {
                    mutateNode(pathOrId: $pathOrId) {
                        unlock
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
