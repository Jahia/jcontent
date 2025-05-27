import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const visibleInContentTree = gql`
    fragment ContentVisibleInContentTree on JCRNode {
        isVisibleInContentTree: isNodeType(type: {
            multi: ANY,
            types: $types
        })
    }
`;

export const GetContentPath = gql`
    query getContentPath($path:String!, $language: String!, $types: [String]!) {
        jcr {
            node: nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                displayName(language: $language)
                primaryNodeType {
                    name
                }
                isNodeType(type: {multi: ANY, types: ["jmix:mainResource", "jnt:page"]})
                ...ContentVisibleInContentTree
                ancestors(fieldFilter: {
                    filters: [
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "rep:root"},
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "jnt:virtualsitesFolder"},
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "jnt:virtualsite"}
                    ]
                }) {
                    displayName(language: $language)
                    primaryNodeType {
                        name
                    }
                    isNodeType(type: {multi: ANY, types: ["jmix:mainResource", "jnt:page"]})
                    ...ContentVisibleInContentTree
                    ...NodeCacheRequiredFields
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${visibleInContentTree}
`;
