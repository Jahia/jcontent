import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";


class WorkflowsAction extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <DxContext.Consumer>{dxContext => {
            const {call, children, context, ...rest} = this.props;
            let ctx = _.cloneDeep(context);
            return children({
                ...rest,
                labelParams: {language: dxContext.langName},
                onClick: () => call(ctx)
            });

        }}</DxContext.Consumer>;
    }

}

export default WorkflowsAction;