import React from "react";
import Constants from "../constants";
import {ContentTypeNamesQuery, ContentTypesQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {from, of} from "rxjs";
import {map, switchMap} from "rxjs/operators";

// class CreateContentAction extends React.Component {
//
//     static filterByBaseType(types, baseTypeName) {
//         return _.filter(types, type => {
//             let superTypes = _.map(type.supertypes, superType => superType.name);
//             return _.includes(superTypes, baseTypeName);
//         });
//     }
//
//     doRender(nodeTypes, context) {
//
//         if (_.isEmpty(nodeTypes)) {
//             return null;
//         }
//
//         let {call, children, notificationContext, t, ...rest} = this.props;
//
//         let ctx = _.cloneDeep(context);
//
//         // if jmix:droppableContent is part of the node types, use the "new content" button item
//         if (_.size(nodeTypes) > Constants.maxCreateContentOfTypeDirectItems || _.includes(nodeTypes, "jmix:droppableContent")) {
//             ctx.includeSubTypes = true;
//             ctx.nodeTypes = nodeTypes;
//             return children({...rest, onClick: () => call(ctx)});
//         } else {
//
//             ctx.includeSubTypes = false;
//
//             return <DxContext.Consumer>{dxContext => (
//                 <Query query={ContentTypeNamesQuery} variables={{nodeTypes: nodeTypes, displayLanguage: dxContext.uilang}}>
//                     {({loading, error, data}) => {
//
//                         if (error) {
//                             let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
//                             notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
//                             return null;
//                         }
//
//                         if (loading || !data || !data.jcr) {
//                             return null;
//                         }
//
//                         return _.map(data.jcr.nodeTypesByNames, nodeType => {
//                             let localCtx = _.cloneDeep(ctx);
//                             localCtx.nodeTypes = [nodeType.name];
//                             return children({
//                                 ...rest,
//                                 labelKey: "label.contentManager.create.contentOfType",
//                                 labelParams: {typeName: nodeType.displayName},
//                                 onClick: () => call(localCtx),
//                                 key: nodeType.name
//                             });
//                         });
//                     }}
//                 </Query>
//             )}</DxContext.Consumer>;
//         }
//     }
//
//     render() {
//
//         let {baseContentType, context, t, notificationContext} = this.props;
//
//         let {node} = context;
//         let childNodeTypes = node.allowedChildNodeTypes;
//         if (!_.isEmpty(baseContentType)) {
//             childNodeTypes = _.union(CreateContentAction.filterByBaseType(childNodeTypes, baseContentType),
//                 CreateContentAction.filterByBaseType(node.subTypes, baseContentType));
//         }
//         let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
//         let contributeTypesProperty = node.contributeTypes;
//
//         if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
//             if (_.isEmpty(baseContentType)) {
//                 return this.doRender(contributeTypesProperty.values, context);
//             } else {
//                 return <Query query={ContentTypesQuery} variables={{nodeTypes: contributeTypesProperty.values}}>
//                     {({loading, error, data}) => {
//
//                         if (error) {
//                             let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
//                             notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
//                             return null;
//                         }
//
//                         if (loading || !data || !data.jcr) {
//                             return null;
//                         }
//
//                         let contributionNodeTypes = data.jcr.nodeTypesByNames;
//                         contributionNodeTypes = CreateContentAction.filterByBaseType(contributionNodeTypes, baseContentType);
//                         let nodeTypes = _.map(contributionNodeTypes, nodeType => nodeType.name);
//                         return this.doRender(nodeTypes, context);
//                     }}
//                 </Query>;
//             }
//         } else {
//             return this.doRender(childNodeTypeNames, context);
//         }
//     }
// }
//
// CreateContentAction = _.flowRight(
//     withNotifications(),
//     translate()
// )(CreateContentAction);

function filterByBaseType(types, baseTypeName) {
    return _.filter(types, type => {
        let superTypes = _.map(type.supertypes, superType => superType.name);
        return _.includes(superTypes, baseTypeName);
    });
}

export default composeActions(requirementsAction, {

    init: (context) => {
        let {baseContentType} = context;

        let obs = context.node.pipe(switchMap((node) => {
            let childNodeTypes = node.allowedChildNodeTypes;
            if (!_.isEmpty(baseContentType)) {
                childNodeTypes = _.union(filterByBaseType(childNodeTypes, baseContentType),
                    filterByBaseType(node.subTypes, baseContentType));
            }
            let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
            let contributeTypesProperty = node.contributeTypes;

            if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                if (_.isEmpty(baseContentType)) {
                    console.log(context.id, "A");
                    return of(contributeTypesProperty.values);
                } else {
                    console.log(context.id, "B");
                    return from(client.watchQuery({query:ContentTypesQuery, variables:{nodeTypes: contributeTypesProperty.values}})).pipe(
                        map((res) => {
                            let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                            contributionNodeTypes = filterByBaseType(contributionNodeTypes, baseContentType);
                            return _.map(contributionNodeTypes, nodeType => nodeType.name);
                        })
                    );
                }
            } else {
                console.log(context.id, "C");
                return of(childNodeTypeNames);
            }
        }), switchMap(nodeTypes => {
            console.log("nodeTypes:",nodeTypes);

            if (_.size(nodeTypes) > Constants.maxCreateContentOfTypeDirectItems || _.includes(nodeTypes, "jmix:droppableContent")) {
                console.log(context.id, "D");
                return of({
                    includeSubTypes: true,
                    nodeTypes: nodeTypes
                })
            } else {
                console.log(context.id, "E");
                return from(client.watchQuery({query:ContentTypeNamesQuery, variables:{nodeTypes: nodeTypes, displayLanguage: context.dxContext.uilang}})).pipe(
                    map((res) => ({
                        actions: res.data.jcr.nodeTypesByNames.map(nodeType => ({
                            includeSubTypes: false,
                            nodeTypes: [nodeType.name]
                        }))
                        })
                    )
                );
            }
        }));
        context.nodeTypes = obs.pipe(map(r => r.nodeTypes));
        context.includeSubTypes = obs.pipe(map(r => r.includeSubTypes));
        context.actions = obs.pipe(map(r => r.actions));

        obs.subscribe((c) => console.log("ret:",c));
    },


    onClick: (context) => {
        window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);

    }

});
