import {
    getNodeByPath,
    getTreeOfContentWithRequirements,
    getTreeOfContentWithRequirementsFromUuid
} from './createContent.gql-queries';
import {useQuery} from '@apollo/client';
import {Tag, toIconComponent} from '@jahia/moonstone';
import React from 'react';

export const useCreatableNodetypesTree = ({nodeTypes, childNodeName, includeSubTypes, path, uuid, uilang, excludedNodeTypes, showOnNodeTypes}) => {
    const {data, error, loadingTypes} = useQuery(uuid ? getTreeOfContentWithRequirementsFromUuid : getTreeOfContentWithRequirements, {
        fetchPolicy: 'cache-and-network',
        variables: {
            nodeTypes: (nodeTypes && nodeTypes.length) > 0 ? nodeTypes : undefined,
            childNodeName,
            includeSubTypes,
            uilang,
            path,
            uuid,
            excludedNodeTypes,
            showOnNodeTypes
        }
    });
    const nodeTypeNotDisplayed = !data?.jcr || (showOnNodeTypes && showOnNodeTypes.length > 0 && data.jcr.nodeByPath && !data.jcr.nodeByPath.isNodeType);

    return {
        error,
        loadingTypes,
        nodetypes: nodeTypeNotDisplayed ? [] : data.forms.contentTypesAsTree
    };
};

export async function getCreatableNodetypesTree({client, nodeTypes, childNodeName, includeSubTypes, path, uuid, uilang, excludedNodeTypes, showOnNodeTypes}) {
    const {data} = await client.query({
        query: uuid ? getTreeOfContentWithRequirementsFromUuid : getTreeOfContentWithRequirements,
        variables: {
            nodeTypes: (nodeTypes && nodeTypes.length) > 0 ? nodeTypes : undefined,
            childNodeName,
            includeSubTypes: includeSubTypes !== false,
            uilang,
            path,
            uuid,
            excludedNodeTypes,
            showOnNodeTypes
        }
    });

    const nodeTypeNotDisplayed = !data?.jcr || (showOnNodeTypes && showOnNodeTypes.length > 0 && data.jcr.nodeByPath && !data.jcr.nodeByPath.isNodeType);
    return nodeTypeNotDisplayed ? [] : data.forms.contentTypesAsTree;
}

export async function getNodeUUID({client, path}) {
    const {data} = await client.query({query: getNodeByPath, variables: {path}});
    return data?.jcr?.nodeByPath?.uuid;
}

export function flattenNodeTypes(nodeTypes) {
    const resolvedTypes = nodeTypes
        .map(category => {
            if (category.children && category.children.length > 0) {
                return category.children;
            }

            return [category];
        })
        .reduce((sum, types) => {
            types.forEach(type => sum.push(type));
            return sum;
        }, []);

    return resolvedTypes || [];
}

export function transformNodeTypesToActions(nodeTypes, hasBypassChildrenLimit, parentName) {
    const nodeTypesButtonLimit = contextJsParameters.config.jcontent['createChildrenDirectButtons.limit'];

    function getNodeTypeIcon(nodeType) {
        if (nodeType.name === 'jnt:category') {
            return <Tag/>;
        }

        return nodeType.iconURL && !nodeType.iconURL.endsWith('/nt_base.png') && toIconComponent(nodeType.iconURL);
    }

    if (hasBypassChildrenLimit || nodeTypes.length <= Number(nodeTypesButtonLimit)) {
        return nodeTypes
            .filter(f => f.name !== 'jnt:resource')
            .map(nodeType => ({
                key: nodeType.name,
                actionKey: nodeType.name,
                flattenedNodeTypes: [nodeType],
                nodeTypesTree: [nodeType],
                nodeTypes: [nodeType.name],
                nodeTypeIcon: getNodeTypeIcon(nodeType),
                buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.contentOfType',
                buttonLabelParams: {typeName: nodeType.label},
                tooltipLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.tooltipForType',
                tooltipParams: {typeName: nodeType.label, parent: parentName}
            }));
    }
}

export function childrenLimitReachedOrExceeded(node, templateLimit) {
    if (!node) {
        return false;
    }

    const childrenCount = node?.['subNodesCount_nt:base'] || 0;
    if (node['jmix:listSizeLimit']) {
        const limit = node?.properties?.find(property => property.name === 'limit')?.value;
        if (limit && childrenCount >= Number(limit)) {
            return true;
        }
    }

    return typeof (templateLimit) === 'number' && !isNaN(templateLimit) && childrenCount >= templateLimit;
}

