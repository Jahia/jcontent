import React from "react";
import * as _ from "lodash";
import {hasMixin} from "../utils.js";
import {translate} from 'react-i18next';

class UndeleteAction extends React.Component {

    abbreviateIfNeeded(displayName) {
        if (!displayName) {
            return "";
        }

        if (displayName.length <= 100) {
            return displayName;
        }
        return this.props.t("label.ellipsis", {text: displayName.substring(0, 100)});
    }

    render() {

        let {children, context, ...rest} = this.props;

        context.displayName = this.abbreviateIfNeeded(context.displayName);

        if (hasMixin(context.node, "jmix:markedForDeletionRoot")) {
            return children({...rest, onClick: () => window.parent.authoringApi.undeleteContent(context.uuid, context.path, context.displayName, context.nodeName)});
        }
        return null;
    }
}

UndeleteAction = _.flowRight(
    translate()
)(UndeleteAction);

export default UndeleteAction;
