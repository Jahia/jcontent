import React from 'react';
import gql from 'graphql-tag';
import {Badge, Typography} from '@material-ui/core';
import {setActiveWorkflowTaskRefetcher} from './../refetches';
import {composeActions, withStylesAction} from '@jahia/react-material';
import {withApolloAction} from './withApolloAction';
import {from} from 'rxjs';
import {filter, map} from 'rxjs/operators';

const styles = () => ({
    badge: {
        background: '#e40000',
        fontWeight: 600,
        fontSize: '11px',
        color: '#fafafa'
    },
    root: {
        verticalAlign: 'top'
    }
});

const query = gql`query getActiveWorkflowTaskCountForUser{
          jcr {
            result:activeWorkflowTaskCountForUser
          }
        }`;

let workflowDashboardAction = composeActions(withStylesAction(styles), withApolloAction, {
    init: context => {
        let classes = context.classes;

        let watchQuery = context.client.watchQuery({query});

        context.badge = from(watchQuery)
            .pipe(
                filter(res => (res.data && res.data.jcr)),
                map(res => res.data.jcr.result > 0 ? <Badge classes={{root: classes.root, badge: classes.badge}} badgeContent={<Typography data-cm-role="workflow-active-task-count">{res.data.jcr.result}</Typography>} color="primary">&nbsp;</Badge> : null)
            );

        setActiveWorkflowTaskRefetcher({refetch: () => {
            watchQuery.refetch();
        }});
    },
    onClick: () => window.parent.authoringApi.openWorkflowDashboard()
});

export default workflowDashboardAction;
