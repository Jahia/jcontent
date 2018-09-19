import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
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

DeleteAction = _.flowRight(
    withNotifications(),
    translate()
)(DeleteAction);

export default DeleteAction;
