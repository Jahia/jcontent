import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";

class DeleteAction extends React.Component {

    render() {

        let {children, context, ...rest} = this.props;

        let mixinTypesProperty = null;
        if (context.node.properties != null) {
            mixinTypesProperty = _.find(context.node.properties, property => property.name === 'jcr:mixinTypes');
        }
        if (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, "jmix:markedForDeletion")) {
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
