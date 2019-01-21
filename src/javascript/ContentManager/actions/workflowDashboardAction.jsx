import gql from 'graphql-tag';
import {setActiveWorkflowTaskRefetcher} from '../ContentManager.refetches';
import {composeActions} from '@jahia/react-material';
import {withApolloAction} from './withApolloAction';
import {from} from 'rxjs';
import {filter, map} from 'rxjs/operators';

const query = gql`query getActiveWorkflowTaskCountForUser{
          jcr {
            result:activeWorkflowTaskCountForUser
          }
        }`;

let workflowDashboardAction = composeActions(withApolloAction, {
    init: context => {
        let watchQuery = context.client.watchQuery({query});
        let watchQueryObs = from(watchQuery);

        context.badge = watchQueryObs
            .pipe(
                filter(res => (res.data && res.data.jcr)),
                map(res => res.data.jcr.result > 0 ? res.data.jcr.result : null)
            );

        setActiveWorkflowTaskRefetcher({refetch: () => {
            watchQuery.refetch();
        }});
    },
    onClick: () => window.parent.authoringApi.openWorkflowDashboard()
});

export default workflowDashboardAction;
