import React from "react";
import Constants from "../constants";
import {ContentTypeNamesQuery, ContentTypesQuery} from "../gqlQueries";
import * as _ from "lodash";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {from, of} from "rxjs";
import {filter, first, map, switchMap} from "rxjs/operators";
import {withDxContextAction} from "./withDxContextAction";

function filterByBaseType(types, baseTypeName) {
    return _.filter(types, type => {
        let superTypes = _.map(type.supertypes, superType => superType.name);
        return _.includes(superTypes, baseTypeName);
    });
}

export default composeActions(requirementsAction, withDxContextAction, {

    init: (context) => {
        let {baseContentType} = context;
        if (!baseContentType) {
            baseContentType = "nt:base";
        }

        context.initRequirements({
            requiredPermission: "jcr:addChildNodes",
            baseContentType,
            getContributeTypesRestrictions: true,
        });
        let obs = context.node.pipe(switchMap((node) => {
            let childNodeTypes = _.union(filterByBaseType( node.allowedChildNodeTypes, baseContentType),
                    filterByBaseType(node.allowedChildNodeTypes, baseContentType));
            let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
            let contributeTypesProperty = node.contributeTypes !== null ? node.contributeTypes : [];
            let parentContributeRestrictions = node.ancestors !== null && !_.isEmpty(node.ancestors) ? node.ancestors[node.ancestors.length-1].contributeTypes.values : [];
            if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values)) {
                return from(context.client.watchQuery({query:ContentTypesQuery, variables:{nodeTypes: contributeTypesProperty.values}})).pipe(
                    filter(res => (res.data && res.data.jcr)),
                    first(),
                    map((res) => {
                        let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                        contributionNodeTypes = filterByBaseType(contributionNodeTypes, baseContentType);
                        return _.map(contributionNodeTypes, nodeType => nodeType.name);
                    })
                );
            } else if(parentContributeRestrictions && !_.isEmpty(parentContributeRestrictions)){
                return from(context.client.watchQuery({query:ContentTypesQuery, variables:{nodeTypes: parentContributeRestrictions}})).pipe(
                    filter(res => (res.data && res.data.jcr)),
                    first(),
                    map((res) => {
                        let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                        contributionNodeTypes = filterByBaseType(contributionNodeTypes, baseContentType);
                        return _.map(contributionNodeTypes, nodeType => nodeType.name);
                    })
                );
            } else {
                return of(childNodeTypeNames);
            }
        }), switchMap(nodeTypes => {
            if (_.size(nodeTypes) > Constants.maxCreateContentOfTypeDirectItems || _.includes(nodeTypes, "jmix:droppableContent")) {
                return of({
                    includeSubTypes: true,
                    nodeTypes: nodeTypes
                })
            } else {
                return from(context.client.watchQuery({query:ContentTypeNamesQuery, variables:{nodeTypes: nodeTypes, displayLanguage: context.dxContext.uilang}})).pipe(
                    filter(res => (res.data && res.data.jcr)),
                    first(),
                    map((res) => ({
                        actions: res.data.jcr.nodeTypesByNames.map(nodeType => ({
                            key:nodeType.name,
                            includeSubTypes: false,
                            nodeTypes: [nodeType.name],
                            buttonLabel: "label.contentManager.create.contentOfType",
                            buttonLabelParams: {typeName: nodeType.displayName},
                        }))
                        })
                    )
                );
            }
        }));
        context.nodeTypes = obs.pipe(map(r => r.nodeTypes));
        context.includeSubTypes = obs.pipe(map(r => r.includeSubTypes));
        context.actions = obs.pipe(map(r => r.actions));
    },


    onClick: (context) => {
        window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);

    }

});
