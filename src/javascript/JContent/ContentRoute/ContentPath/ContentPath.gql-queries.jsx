import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {PageBuilderNodeFragment} from '~/JContent/JContentUtils.gql-queries';

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
                ...PageBuilderNode
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
                    ...PageBuilderNode
                    ...ContentVisibleInContentTree
                    ...NodeCacheRequiredFields
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${visibleInContentTree}
    ${PageBuilderNodeFragment.gql}
`;
