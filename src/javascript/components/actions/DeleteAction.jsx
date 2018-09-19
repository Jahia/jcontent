import React from "react";
import {hasMixin} from "../utils.js";

class DeleteAction extends React.Component {

    render() {

        let {children, context, ...rest} = this.props;

        if (hasMixin(context.node, "jmix:markedForDeletion")) {
            return null;
        }

        return children({
            ...rest,
            onClick: () => window.parent.authoringApi.deleteContent(context.path, context.displayName, ["jnt:content"], ["nt:base"], false, false)
        });
    }
}

export default DeleteAction;
