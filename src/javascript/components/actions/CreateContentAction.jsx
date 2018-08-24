import React from "react";
import Constants from "../constants";
import {ContentTypeQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";

class CreateContentAction extends React.Component {

    render() {

        const {children, context, t, call, notificationContext, ...rest} = this.props;
        if (!context.isAllowedChildNodeType) {
            return null;
        }
        // if jmix:droppableContent is part of the nodetypes, use the "new content" button item
        if (_.size(context.nodeTypes) > Constants.maxCreateContentOfTypeDirectItems || _.includes(context.nodeTypes, "jmix:droppableContent")) {
            context.includeSubTypes = true;
            return children({...rest, onClick: () => call(context)})
        } else {
            context.includeSubTypes = false;
            return _.map(context.nodeTypes, type => {
                return <DxContext.Consumer key={type}>{dxContext => (
                    <Query query={ContentTypeQuery} variables={{nodeType: type, displayLanguage: dxContext.uilang}}>
                        {({loading, error, data}) => {
                            if (error) {
                                let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                                notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                                return null;
                            }

                            if (loading || !data || !data.jcr) {
                                return null;
                            }
                            let ctx = _.cloneDeep(context);
                            ctx.nodeTypes = [type];
                            ctx.show

                            return children({
                                ...rest,
                                labelKey: "label.contentManager.create.contentOfType",
                                labelParams: {typeName: data.jcr.nodeTypeByName.displayName},
                                onClick: () => call(ctx)
                            });
                        }}
                    </Query>
                )}</DxContext.Consumer>
            });
        }
    }
}

export default translate()(withNotifications()(CreateContentAction));
