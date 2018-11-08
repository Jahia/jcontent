import React from "react";
import gql from "graphql-tag";
import {Badge, Typography} from '@material-ui/core';
import {setActiveWorkflowTaskRefetcher} from './../refetches';
import {composeActions, withStylesAction} from "@jahia/react-material";
import {withApolloAction} from "./withApolloAction";
import {from, Subject} from "rxjs";
import {filter, map} from 'rxjs/operators';

const styles = theme => ({
    badge: {
        background: '#e40000',
        fontWeight: 600,
        fontSize: '11px',
        color: '#fafafa',
    },
    root: {
        verticalAlign: "top"
    }
});

const query = gql `query getActiveWorkflowTaskCountForUser{
          jcr {
            result:activeWorkflowTaskCountForUser
          }
        }`;
const badge = new Subject();

let workflowDashboardAction = composeActions(withStylesAction(styles), withApolloAction,  {
    badge: badge,
    onMount: (context) => {
        let classes = context.classes;

        let watchQuery = context.client.watchQuery({query});
        from(watchQuery)
            .pipe(
                filter(res => (res.data && res.data.jcr)),
                map(res => res.data.jcr.result > 0 ? <Badge classes={{root: classes.root, badge: classes.badge}} badgeContent={<Typography data-cm-role={'workflow-active-task-count'}>{res.data.jcr.result}</Typography>} color="primary">&nbsp;</Badge>: null)
            )
            .subscribe(badge);

        setActiveWorkflowTaskRefetcher({refetch: () => { debugger;watchQuery.refetch() } });
    },
    onClick: () => window.parent.authoringApi.openWorkflowDashboard()

});

//
// class  extends React.Component {
//
//     render() {
//         return <DxContext.Consumer>{dxContext => {
//             const {call, children, context, pollInterval, classes, ...rest} = this.props;
//             let ctx = _.cloneDeep(context);
//             let child = children({
//                 ...rest,
//                 labelParams: {language: dxContext.langName},
//                 onClick: () => call(ctx)
//             });
//
//             return <Query query={this.query}>
//                 {
//                     ({error, loading, data, refetch}) => {
//                         setActiveWorkflowTaskRefetcher({refetch: refetch});
//                         if (!loading && !error) {
//                             let numberOfTasks = data.jcr.result;
//                             if (numberOfTasks !== 0) {
//                                 return children({...rest,
//                                     labelParams: {language: dxContext.langName},
//                                     onClick: () => call(ctx),
//                                     badge: <Badge  classes={{root: classes.root, badge: classes.badge}} badgeContent={<Typography data-cm-role={'workflow-active-task-count'}>{numberOfTasks}</Typography>} color="primary">&nbsp;</Badge>})
//                             } else {
//                                 return child;
//                             }
//                         }else{
//                             return null;
//                         }
//                     }
//                 }
//             </Query>
//         }}</DxContext.Consumer>;
//     }
//
// }
//
// WorkflowDashboardAction = _.flowRight(
//     withStyles(styles, {withTheme: true})
// )(WorkflowDashboardAction);

export default workflowDashboardAction;