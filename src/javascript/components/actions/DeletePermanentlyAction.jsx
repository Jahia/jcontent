import React from "react";
import * as _ from "lodash";

class DeletePermanentlyAction extends React.Component {

    render() {

        let {children, context, ...rest} = this.props;

        let mixinTypesProperty = null;
        if (context.node.properties != null) {
            mixinTypesProperty = _.find(context.node.properties, property => property.name === 'jcr:mixinTypes');
        }
        if (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, "jmix:markedForDeletionRoot")) {
            return children({
                ...rest,
                onClick: () => window.parent.authoringApi.deleteContent(context.path, context.displayName, ["jnt:content"], ["nt:base"], false, true)
            });
        }

        return null;
    }
}

export default DeletePermanentlyAction;
