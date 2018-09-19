import React from "react";
import {hasMixin} from "../utils.js";

class DeletePermanentlyAction extends React.Component {

    render() {

        let {children, context, ...rest} = this.props;

        if (!hasMixin(context.node, "jmix:markedForDeletionRoot")) {
            return null;
        }
        if (context.node.aggregatedPublicationInfo.publicationStatus != "NOT_PUBLISHED") {
            return null;
        }

        return children({
            ...rest,
            onClick: () => window.parent.authoringApi.deleteContent(context.path, context.displayName, ["jnt:content"], ["nt:base"], false, true)
        });
    }
}

export default DeletePermanentlyAction;
