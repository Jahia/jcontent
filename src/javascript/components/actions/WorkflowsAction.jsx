import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";
import gql from "graphql-tag";
import Badge from '@material-ui/core/Badge';


class WorkflowsAction extends React.Component {

    constructor(props) {
        super(props);
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
            return <Badge badgeContent={4} color="primary">{child}</Badge>

        }}</DxContext.Consumer>;
    }

}

export default WorkflowsAction;