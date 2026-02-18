import {useQuery} from '@apollo/client';
import {useNodeChecks} from '@jahia/data-helper';
import {NodeTypeInfos} from '~/JContent/EditFrame/Boxes/dataHooks/dataHooks.gql-queries';

export const useButtonsData = ({createButtons, language, uilang}) => {
    const paths = [];
    const nodeTypeInfos = [];

    createButtons.forEach(b => {
        paths.push(b.node.path);
        nodeTypeInfos.push({
            path: b.node.path,
            nodeTypes: b.attributes.nodeTypes
        });
    });

    const {loading, data} = useQuery(NodeTypeInfos, {variables: {uilang, types: nodeTypeInfos}, skip: nodeTypeInfos.length === 0});

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

    if (loading || res.loading || !res?.nodes || !data?.forms?.nodeTypeInfos) {
        return {nodes: null};
    }

    const output = {nodes: res.nodes};

    data.forms.nodeTypeInfos.forEach(nodeTypeInfo => {
        if (output.nodes[nodeTypeInfo.path]) {
            output.nodes[nodeTypeInfo.path].acceptedNodeTypes = nodeTypeInfo.nodeTypeInfos;
        }
    });

    return output;
};
