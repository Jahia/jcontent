import gql from 'graphql-tag';

export const GET_MANAGED_TAGS = gql`
    query GetManagedTags($siteKey: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    tags {
                        nodes {
                            name
                            occurrences
                        }
                        pageInfo {
                            totalCount
                            nodesCount
                        }
                    }
                }
            }
        }
    }
`;

export const GET_TAGGED_CONTENT = gql`
    query GetTaggedContent($siteKey: String!, $tag: String!, $limit: Int, $offset: Int, $language: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    taggedContent(tag: $tag, limit: $limit, offset: $offset) {
                        nodes {
                            uuid
                            path
                            displayName(language: $language)
                            primaryNodeType {
                                displayName(language: $language)
                                name
                                icon
                            }
                        }
                        pageInfo {
                            totalCount
                            nodesCount
                            hasPreviousPage
                            hasNextPage
                        }
                    }
                }
            }
        }
    }
`;

export const RENAME_TAG_ON_NODE = gql`
    mutation RenameTagOnNode($siteKey: String!, $tag: String!, $newName: String!, $nodeId: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    renameTagOnNode(tag: $tag, newName: $newName, nodeId: $nodeId) {
                        tag
                        nodeId
                        workspaceResults {
                            workspace
                            processedCount
                            failedCount
                            failedPaths
                        }
                    }
                }
            }
        }
    }
`;

export const RENAME_TAG = gql`
    mutation RenameTag($siteKey: String!, $tag: String!, $newName: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    renameTag(tag: $tag, newName: $newName) {
                        tag
                        workspaceResults {
                            workspace
                            processedCount
                            failedCount
                            failedPaths
                        }
                    }
                }
            }
        }
    }
`;

export const DELETE_TAG = gql`
    mutation DeleteTag($siteKey: String!, $tag: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    deleteTag(tag: $tag) {
                        tag
                        workspaceResults {
                            workspace
                            processedCount
                            failedCount
                            failedPaths
                        }
                    }
                }
            }
        }
    }
`;

export const DELETE_TAG_ON_NODE = gql`
    mutation DeleteTagOnNode($siteKey: String!, $tag: String!, $nodeId: String!) {
        admin {
            jahia {
                tagManager(siteKey: $siteKey) {
                    deleteTagOnNode(tag: $tag, nodeId: $nodeId) {
                        tag
                        nodeId
                        workspaceResults {
                            workspace
                            processedCount
                            failedCount
                            failedPaths
                        }
                    }
                }
            }
        }
    }
`;

export const SUGGEST_TAGS = gql`
    query SuggestManagedTags($prefix: String!, $startPath: String!, $limit: Long!, $offset: Long, $minCount: Long, $sortByCount: Boolean) {
        tag {
            suggest(prefix: $prefix, startPath: $startPath, limit: $limit, offset: $offset, minCount: $minCount, sortByCount: $sortByCount) {
                name
                occurences
            }
        }
    }
`;
