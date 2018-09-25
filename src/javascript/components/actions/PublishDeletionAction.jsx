import React from "react";
import {hasMixin} from "../utils.js";

class PublishDeletionAction extends React.Component {

    render() {

        let {context, children, ...rest} = this.props;

        if (!hasMixin(context.node, "jmix:markedForDeletionRoot")) {
            return null;
        }
        if (context.node.aggregatedPublicationInfo.publicationStatus == "NOT_PUBLISHED") {
            return null;
        }

        return children({
            ...rest,
            onClick: () => window.parent.authoringApi.openPublicationWorkflow([context.node.uuid], true, false, false)
        });
    }
}

export default PublishDeletionAction;