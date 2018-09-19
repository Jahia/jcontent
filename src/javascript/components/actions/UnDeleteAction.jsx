import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withApollo} from 'react-apollo';
import {withNotifications} from "@jahia/react-material/index";

class UnDeleteAction extends React.Component {

    render() {

        let {call, children, context, ...rest} = this.props;
        let ctx = _.cloneDeep(context);

        ctx.displayName = ctx.displayName.substring(0, 100) + "...";

        let mixinTypesProperty = null;
        if (context.node.properties != null) {
            mixinTypesProperty = _.find(context.node.properties, property => property.name === 'jcr:mixinTypes');
        }
        if (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, "jmix:markedForDeletionRoot")) {
            return children({...rest, onClick: () => call(ctx)});
        }
        return null;
    }
}

UnDeleteAction = _.flowRight(
    withNotifications(),
    translate(),
    withApollo,
)(UnDeleteAction);

export default UnDeleteAction;
