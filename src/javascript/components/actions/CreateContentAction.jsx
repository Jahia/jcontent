import React from "react";
import Constants from "../constants";
import {ContentTypesQuery, ContentTypeNamesQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";

class CreateContentAction extends React.Component {

    static filterByBaseType(types, baseTypeName) {
        return _.filter(types, type => {
            let superTypes = _.map(type.supertypes, superType => superType.name);
            return _.includes(superTypes, baseTypeName);
        });
    }

    doRender(nodeTypes, context) {

        if (_.isEmpty(nodeTypes)) {
            return null;
        }

        let {call, children, notificationContext, t, ...rest} = this.props;

        let ctx = _.cloneDeep(context);

        // if jmix:droppableContent is part of the node types, use the "new content" button item
        if (_.size(nodeTypes) > Constants.maxCreateContentOfTypeDirectItems || _.includes(nodeTypes, "jmix:droppableContent")) {
            ctx.includeSubTypes = true;
            ctx.nodeTypes = nodeTypes;
            return children({...rest, onClick: () => call(ctx)});
        } else {

            ctx.includeSubTypes = false;

            return <DxContext.Consumer>{dxContext => (
                <Query query={ContentTypeNamesQuery} variables={{nodeTypes: nodeTypes, displayLanguage: dxContext.uilang}}>
                    {({loading, error, data}) => {

                        if (error) {
                            let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            return null;
                        }

                        if (loading || !data || !data.jcr) {
                            return null;
                        }

                        return _.map(data.jcr.nodeTypesByNames, nodeType => {
                            ctx.nodeTypes = [nodeType.name];
                            return children({
                                ...rest,
                                labelKey: "label.contentManager.create.contentOfType",
                                labelParams: {typeName: nodeType.displayName},
                                onClick: () => call(ctx),
                                key: nodeType.name
                            });
                        });
                    }}
                </Query>
            )}</DxContext.Consumer>;
        }
    }

    render() {

        let {baseContentType, context, t, notificationContext} = this.props;

        let {node} = context;
        let childNodeTypes = node.allowedChildNodeTypes;
        if (!_.isEmpty(baseContentType)) {
            childNodeTypes = _.union(CreateContentAction.filterByBaseType(childNodeTypes, baseContentType),
                CreateContentAction.filterByBaseType(node.subTypes, baseContentType));
        }
        let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
        let contributeTypesProperty = node.contributeTypes;

        if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
            if (_.isEmpty(baseContentType)) {
                return this.doRender(contributeTypesProperty.values, context);
            } else {
                return <Query query={ContentTypesQuery} variables={{nodeTypes: contributeTypesProperty.values}}>
                    {({loading, error, data}) => {

                        if (error) {
                            let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            return null;
                        }

                        if (loading || !data || !data.jcr) {
                            return null;
                        }

                        let contributionNodeTypes = data.jcr.nodeTypesByNames;
                        contributionNodeTypes = CreateContentAction.filterByBaseType(contributionNodeTypes, baseContentType);
                        let nodeTypes = _.map(contributionNodeTypes, nodeType => nodeType.name);
                        return this.doRender(nodeTypes, context);
                    }}
                </Query>;
            }
        } else {
            return this.doRender(childNodeTypeNames, context);
        }
    }
}

CreateContentAction = _.flowRight(
    withNotifications(),
    translate()
)(CreateContentAction);

export default CreateContentAction;
