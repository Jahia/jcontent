import React from "react";
import {ContentTypeNamesQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";

class CreateContentOfTypeAction extends React.Component {

    render() {

        let {contentType, context, call, children, notificationContext, t, labelKey, ...rest} = this.props;

        if (_.isEmpty(context.node.allowedChildNodeTypes)) {
            return null;
        }

        let ctx = _.cloneDeep(context);

        return <DxContext.Consumer>{dxContext => (
            <Query query={ContentTypeNamesQuery} variables={{nodeTypes: [contentType], displayLanguage: dxContext.uilang}}>
                {({loading, error, data}) => {

                    if (error) {
                        let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading || !data || !data.jcr) {
                        return null;
                    }

                    let nodeType = data.jcr.nodeTypesByNames[0];
                    ctx.nodeTypes = [nodeType.name];

                    return children({
                        ...rest,
                        labelKey: labelKey || "label.contentManager.create.contentOfType",
                        labelParams: {typeName: nodeType.displayName},
                        onClick: () => call(ctx)
                    });
                }}
            </Query>
        )}</DxContext.Consumer>;
    }
}

CreateContentOfTypeAction = _.flowRight(
    withNotifications(),
    translate()
)(CreateContentOfTypeAction);

export default {};
