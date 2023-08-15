import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const DeleteUsageFragment = gql`    
    fragment DeleteUsageFragment on JCRNode {
        ...NodeCacheRequiredFields
        usages: references(fieldFilter: {filters: {fieldName: "node.visible", value: "true"}}, limit: 1) {
            nodes {
                node {
                    ...NodeCacheRequiredFields
                    visible: isNodeType(type: {types: ["jnt:workflowTask"], multi: NONE})
                    path
                }
            }
        }
    }
`;

const DeleteQueries = gql`
    query DeleteQueries($paths: [String!]!, $language:String!, $getUsages: Boolean!) {
        jcr {
            nodesByPath(paths: $paths) {
                ...NodeCacheRequiredFields
                displayName(language: $language)
                ...DeleteUsageFragment
                pages : descendants(typesFilter:{types:["jnt:page"], multi:ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
                folders : descendants(typesFilter:{types:["jnt:folder"], multi:ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
                content : descendants(typesFilter:{types:["jnt:content", "jnt:file"], multi:ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
                allDescendants : descendants(typesFilter:{types:["jnt:content", "jnt:page", "jnt:folder", "jnt:file", "jnt:category"], multi:ANY}, limit: 100) @include(if: $getUsages) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        ...DeleteUsageFragment
                    }
                }

                isPage: isNodeType(type:{types: ["jnt:page"], multi: ALL})
                isFolder: isNodeType(type:{types: ["jnt:folder"], multi: ANY})
                isMarkedForDeletionRoot: isNodeType(type:{types: ["jmix:markedForDeletionRoot"], multi: ALL})
                isMarkedForDeletion: isNodeType(type:{types: ["jmix:markedForDeletion"], multi: ALL})
                deletionInfo: properties(names: ["j:deletionUser","j:deletionDate","j:deletionMessage"]) {
                    name
                    value
                }
                rootDeletionInfo: ancestors(
                    fieldFilter: {
                        multi: ALL
                        filters: {
                            evaluation: EQUAL
                            fieldName: "isMarkedForDeletionRoot"
                            value: "true"
                        }
                    }
                ) {
                    ...NodeCacheRequiredFields
                    isMarkedForDeletionRoot: isNodeType(
                        type: { types: ["jmix:markedForDeletionRoot"], multi: ALL }
                    )
                    displayName(language: $language)
                    properties(
                        names: ["j:deletionUser", "j:deletionDate", "j:deletionMessage"]
                    ) {
                        name
                        value
                    }
                }
            }
        }
    }
    ${DeleteUsageFragment}
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {DeleteQueries};
