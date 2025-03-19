import gql from 'graphql-tag';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export const BoxesQuery = gql`
    query getBoxesNodes($paths:[String!]!, $language:String!, $displayLanguage:String!) {
        jcr {
            nodesByPath(paths: $paths) {
                ...NodeFields
                translationLanguages,
                invalidLanguages: property(name: "j:invalidLanguages") {
                    values
                }
                permissions: descendant(relPath:"j:acl") {
                    ...NodeCacheRequiredFields
                    children {
                        nodes {
                            ...NodeCacheRequiredFields
                        }
                    }
                },
                channelConditions: property(name: "j:channelSelection") {
                    values
                }
                visibilityConditions: descendant(relPath:"j:conditionalVisibility") {
                    ...NodeCacheRequiredFields
                    children {
                        nodes {
                            ...NodeCacheRequiredFields
                        }
                    }
                },
                primaryNodeType {
                    icon
                }
                subNodes: children {
                    pageInfo {
                        totalCount
                    }
                }
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
`;
