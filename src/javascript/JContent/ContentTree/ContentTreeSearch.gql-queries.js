import gql from 'graphql-tag';

export const SearchTreeNodesQuery = gql`
    query searchTreeNodesByTitle($rootPath: String!, $nodeType: String!, $searchTerm: String!, $language: String!, $limit: Int) {
        jcr {
            nodesByCriteria(
                criteria: {
                    nodeType: $nodeType
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: {
                        like: $searchTerm
                        property: "jcr:title"
                        function: LOWER_CASE
                    }
                }
                limit: $limit
            ) {
                pageInfo {
                    totalCount
                }
                nodes {
                    uuid
                    path
                }
            }
        }
    }
`;
