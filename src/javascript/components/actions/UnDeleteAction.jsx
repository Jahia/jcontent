import React from "react";
import * as _ from "lodash";

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

export default UnDeleteAction;
