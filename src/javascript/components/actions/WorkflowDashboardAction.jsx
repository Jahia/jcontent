import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import Badge from '@material-ui/core/Badge';


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
            const {call, children, context, ...rest} = this.props;
            let ctx = _.cloneDeep(context);
            let child = children({
                ...rest,
                labelParams: {language: dxContext.langName},
                onClick: () => call(ctx)
            });

            return <Query query={this.query} pollInterval={2000}>
                {
                    ({error, loading, data}) => {
                        if (!loading && !error) {
                            let numberOfTasks = data.jcr.result;
                            if (numberOfTasks !== 0) {
                                return <Badge badgeContent={numberOfTasks} color="primary" data-cm-role={'notification-badge'}>{child}</Badge>
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