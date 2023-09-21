import {getTreeOfContentWithRequirements} from './createContent.gql-queries';
import {useQuery} from '@apollo/client';
import {toIconComponent} from '@jahia/moonstone';

// eslint-disable-next-line
export const useCreatableNodetypesTree = (nodeTypes, childNodeName, includeSubTypes, path, uilang, excludedNodeTypes, showOnNodeTypes) => {
    const {data, error, loadingTypes} = useQuery(getTreeOfContentWithRequirements, {
        fetchPolicy: 'cache-and-network',
        variables: {
            nodeTypes: (nodeTypes && nodeTypes.length) > 0 ? nodeTypes : undefined,
            childNodeName,
            includeSubTypes,
            uilang,
            path,
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
// eslint-disable-next-line
export async function getCreatableNodetypesTree(client, nodeTypes, childNodeName, includeSubTypes, path, uilang, excludedNodeTypes, showOnNodeTypes) {
    const {data} = await client.query({
        query: getTreeOfContentWithRequirements,
        variables: {
            nodeTypes: (nodeTypes && nodeTypes.length) > 0 ? nodeTypes : undefined,
            childNodeName,
            includeSubTypes: includeSubTypes !== false,
            uilang,
            path,
            excludedNodeTypes,
            showOnNodeTypes
        }
    });

    const nodeTypeNotDisplayed = !data?.jcr || (showOnNodeTypes && showOnNodeTypes.length > 0 && data.jcr.nodeByPath && !data.jcr.nodeByPath.isNodeType);
    return nodeTypeNotDisplayed ? [] : data.forms.contentTypesAsTree;
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

export function transformNodeTypesToActions(nodeTypes, hasBypassChildrenLimit) {
    const nodeTypesButtonLimit = contextJsParameters.config.jcontent['createChildrenDirectButtons.limit'];
    if (hasBypassChildrenLimit || nodeTypes.length <= Number(nodeTypesButtonLimit)) {
        return nodeTypes
            .filter(f => f.name !== 'jnt:resource')
            .map(nodeType => ({
                key: nodeType.name,
                actionKey: nodeType.name,
                flattenedNodeTypes: [nodeType],
                nodeTypesTree: [nodeType],
                nodeTypes: [nodeType.name],
                nodeTypeIcon: nodeType.iconURL && !nodeType.iconURL.endsWith('/nt_base.png') && toIconComponent(nodeType.iconURL),
                buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.contentOfType',
                buttonLabelParams: {typeName: nodeType.label}
            }));
    }
}

export function childrenLimitReachedOrExceeded(node, templateLimit) {
    if (!node) {
        return false;
    }

    const childrenCount = node?.subNodes?.pageInfo?.totalCount || 0;
    if (node['jmix:listSizeLimit']) {
        const limit = node?.properties?.find(property => property.name === 'limit')?.value;
        if (limit && childrenCount >= Number(limit)) {
            return true;
        }
    }

    return typeof (templateLimit) === 'number' && childrenCount >= templateLimit;
}

