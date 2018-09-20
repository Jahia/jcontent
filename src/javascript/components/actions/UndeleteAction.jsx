import React from "react";
import * as _ from "lodash";
import {hasMixin} from "../utils.js";

class UndeleteAction extends React.Component {

    splitdisplayName(displayName){
        return displayName.length > 100 ? displayName.substring(0, 100) + "..." : displayName;
    }

    render() {

        let {children, context, ...rest} = this.props;
        let ctx = _.cloneDeep(context);

        ctx.displayName = this.splitdisplayName(ctx.displayName);

        if (hasMixin(ctx.node, "jmix:markedForDeletion")) {
            return children({...rest, onClick: () => window.parent.authoringApi.unDeleteContent(ctx.path, ctx.displayName, ctx.nodeName)});
        }
        return null;
    }
}

export default UndeleteAction;
