import {useQuery} from '@apollo/client';
import {useNodeChecks} from '@jahia/data-helper';
import {getNodeTypeInfo} from '~/ContentEditor/actions/jcontent/createContent/createContent.gql-queries';

export const useButtonsData = ({createButtons, language, uilang}) => {
    const paths = [];
    const nodeTypes = new Set();

    createButtons.forEach(b => {
        paths.push(b.node.path);
        b.attributes?.nodeTypes?.forEach(nt => nodeTypes.add(nt));
    });

    const {loading, data} = useQuery(getNodeTypeInfo, {variables: {nodeTypes: Array.from(nodeTypes), uiLocale: uilang}, skip: nodeTypes.length === 0});

    // This data will be used to drive createContentPB actions
    const res = useNodeChecks({
        paths,
        language
    }, {
        mapResults: true, // This creates a map of {path: node result}
        // From node checks
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
        hideOnNodeTypes: ['jnt:navMenuText', 'jnt:page'],
        requiredPermission: ['jcr:addChildNodes'],
        hasBypassChildrenLimit: false,
        getChildNodeTypes: true,
        getLockInfo: true,
        // From node info
        getPrimaryNodeType: true,
        getSubNodesCount: ['nt:base'],
        getIsNodeTypes: ['jmix:listSizeLimit'],
        getProperties: ['limit']
    });

    if (loading || res.loading) {
        return {nodes: null, loading: true};
    }

    if (data?.error || res?.error) {
        const error = data?.error || res?.error;
        console.error('Failed to get data for create buttons.', error);
        return {nodes: null, error};
    }

    if (!res?.nodes || !data?.forms?.nodeTypeInfo) {
        console.warn('Could not find data for create buttons.');
        return {nodes: null, loading: false};
    }

    const output = {nodes: res.nodes};

    // Build the nodetype lookup
    const nodeTypeInfoMap = new Map(data.forms.nodeTypeInfo.map(nt => [nt.name, nt]));

    createButtons.forEach(b => {
        const node = output.nodes[b.node.path];
        if (node) {
            // Map list of node type names to the full info objects
            node.acceptedNodeTypes = b.attributes?.nodeTypes?.map(nt => nodeTypeInfoMap.get(nt)) || [];
        }
    });

    return output;
};
