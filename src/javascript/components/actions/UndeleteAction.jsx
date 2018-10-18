import React from "react";
import * as _ from "lodash";
import {hasMixin, abbreviateIfNeeded} from "../utils.js";
import {translate} from 'react-i18next';

class UndeleteAction extends React.Component {

    render() {

        let {children, context, t, ...rest} = this.props;

        if (hasMixin(context.node, "jmix:markedForDeletionRoot")) {
            let displayName = abbreviateIfNeeded(context.displayName, 100, t);
            return children({...rest, onClick: () => window.parent.authoringApi.undeleteContent(context.uuid, context.path, (displayName ? displayName : ""), context.nodeName)});
        }
        return null;
    }
}

UndeleteAction = _.flowRight(
    translate()
)(UndeleteAction);

export default UndeleteAction;
