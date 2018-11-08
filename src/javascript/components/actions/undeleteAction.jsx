import React from "react";
import * as _ from "lodash";
import {hasMixin, ellipsizeText} from "../utils.js";
import {translate} from 'react-i18next';

class UndeleteAction extends React.Component {

    render() {

        let {children, context, ...rest} = this.props;

        if (hasMixin(context.node, "jmix:markedForDeletionRoot")) {
            return children({...rest, onClick: () => window.parent.authoringApi.undeleteContent(context.uuid, context.path, (context.displayName ? ellipsizeText(context.displayName, 100) : ""), context.nodeName)});
        }
        return null;
    }
}

UndeleteAction = _.flowRight(
    translate()
)(UndeleteAction);

export default {};
