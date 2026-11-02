import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import JContentConstants from './JContent.constants';

export const GetAncestorsQueryById = gql`
    query getAncestorsQuery($uuid:String!) {
        jcr {
            node: nodeById(uuid:$uuid) {
                ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite", "jnt:virtualsitesFolder"]}}) {
                    primaryNodeType {
                        name
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                primaryNodeType {
                    name
                }
                site {
                    name
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export const GetAncestorsQueryByPath = gql`
    query getAncestorsQuery($path:String!) {
        jcr {
            node: nodeByPath(path:$path) {
                ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite", "jnt:virtualsitesFolder"]}}) {
                    primaryNodeType {
                        name
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                primaryNodeType {
                    name
                }
                site {
                    name
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

// The fields of a node that isPageBuilderNode reads: useNodeInfo takes it as its applyFragment, and a query of its own
// spreads it
export const PageBuilderNodeFragment = {
    applyFor: 'node',
    gql: gql`fragment PageBuilderNode on JCRNode {
        primaryNodeType {
            name
        }
        isPageBuilderType: isNodeType(type: {multi: ANY, types: ${JSON.stringify(JContentConstants.pageBuilderNodeTypes)}})
        isPage: isNodeType(type: {types: ["jnt:page"]})
        isPageOrMainResource: isNodeType(type: {multi: ANY, types: ["jnt:page", "jmix:mainResource"]})
        isContent: isNodeType(type: {types: ["jnt:content"]})
        displayableNode {
            ...NodeCacheRequiredFields
            isFolder: isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
        }
    }`
};
