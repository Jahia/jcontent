import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const TreeOfContentDataFragment = gql`fragment TreeOfContentData on NodeTypeTreeEntry {
    id
    name
    label
    iconURL
    nodeType {
        name
        mixin
    }
    children {
        id
        name
        nodeType {
            name
            mixin
        }
        parent {
            id
            name
        }
        label
        iconURL
    }
} 
`;

export const getTreeOfContentWithRequirements = gql`
    query getTreeOfContentWithRequirements($nodeTypes:[String], $childNodeName: String, $includeSubTypes: Boolean, $excludedNodeTypes:[String], $showOnNodeTypes:[String]!, $uilang:String!, $path:String!){
        forms {
            contentTypesAsTree(nodeTypes:$nodeTypes, childNodeName:$childNodeName, includeSubTypes:$includeSubTypes, uuidOrPath:$path, uiLocale:$uilang, excludedNodeTypes:$excludedNodeTypes) {
                ...TreeOfContentData
            }
        }
        jcr {
            nodeByPath(path: $path) {
                isNodeType(type: {types:$showOnNodeTypes})
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${TreeOfContentDataFragment}
`;

export const getTreeOfContentWithRequirementsFromUuid = gql`
    query getTreeOfContentWithRequirements($nodeTypes:[String], $childNodeName: String, $includeSubTypes: Boolean, $excludedNodeTypes:[String], $showOnNodeTypes:[String]!, $uilang:String!, $uuid:String!){
        forms {
            contentTypesAsTree(nodeTypes:$nodeTypes, childNodeName:$childNodeName, includeSubTypes:$includeSubTypes, uuidOrPath:$uuid, uiLocale:$uilang, excludedNodeTypes:$excludedNodeTypes) {
                ...TreeOfContentData
            }
        }
        jcr {
            nodeById(uuid: $uuid) {
                isNodeType(type: {types:$showOnNodeTypes})
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${TreeOfContentDataFragment}
`;

export const getNodeByPath = gql`
    query($path:String!) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
