import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import {Badge, Typography} from '@material-ui/core';


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
            const {call, children, context, pollInterval, ...rest} = this.props;
            let ctx = _.cloneDeep(context);
            let child = children({
                ...rest,
                labelParams: {language: dxContext.langName},
                onClick: () => call(ctx)
            });

            return <Query query={this.query} pollInterval={pollInterval != null ? pollInterval : 2000}>
                {
                    ({error, loading, data}) => {
                        if (!loading && !error) {
                            let numberOfTasks = data.jcr.result;
                            if (numberOfTasks !== 0) {
                                return <Badge badgeContent={<Typography data-cm-role={'workflow-active-task-count'}>{numberOfTasks}</Typography>} color="primary">{child}</Badge>
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

export default WorkflowDashboardAction;