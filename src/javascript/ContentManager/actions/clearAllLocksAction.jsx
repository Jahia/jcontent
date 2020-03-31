import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {map} from 'rxjs/operators';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {withDxContextAction} from './withDxContextAction';

export default composeActions(requirementsAction, withDxContextAction, {
    init: context => {
        context.initRequirements({
            getLockInfo: true,
            requiredPermission: 'clearLock',
            enabled: context => context.node.pipe(map(node => node.lockTypes !== null && !_.includes(node.lockTypes.values, ' deletion :deletion')))
        });
    },
    onClick: context => {
        context.client.mutate({
            variables: {pathOrId: context.path},
            mutation: gql`mutation clearAllLocks($pathOrId: String!) {
                jcr {
                    mutateNode(pathOrId: $pathOrId) {
                        clearAllLocks
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
