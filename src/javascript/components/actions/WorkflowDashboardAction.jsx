import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import {Badge, Typography, withStyles} from '@material-ui/core';
import {setRefetcher, refetchTypes} from './../refetches';

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
})

class WorkflowDashboardAction extends React.Component {

    constructor(props) {
        super(props);

        this.query = gql `query getActiveWorkflowTaskCountForUser{
          jcr {
            result:activeWorkflowTaskCountForUser
          }
        }`;

    }

    render() {
        return <DxContext.Consumer>{dxContext => {
            const {call, children, context, pollInterval, classes, ...rest} = this.props;
            let ctx = _.cloneDeep(context);
            let child = children({
                ...rest,
                labelParams: {language: dxContext.langName},
                onClick: () => call(ctx)
            });

            return <Query query={this.query}>
                {
                    ({error, loading, data, refetch}) => {
                        setRefetcher(refetchTypes.ACTIVE_WORKFLOW_TASKS, {refetch: refetch});
                        if (!loading && !error) {
                            let numberOfTasks = data.jcr.result;
                            if (numberOfTasks !== 0) {
                                return children({...rest,
                                    labelParams: {language: dxContext.langName},
                                    onClick: () => call(ctx),
                                    badge: <Badge  classes={{root: classes.root, badge: classes.badge}} badgeContent={<Typography data-cm-role={'workflow-active-task-count'}>{numberOfTasks}</Typography>} color="primary">&nbsp;</Badge>})
                            } else {
                                return child;
                            }
                        }else{
                            return null;
                        }
                    }
                }
            </Query>
        }}</DxContext.Consumer>;
    }

}

WorkflowDashboardAction = _.flowRight(
    withStyles(styles, {withTheme: true})
)(WorkflowDashboardAction);

export default WorkflowDashboardAction;