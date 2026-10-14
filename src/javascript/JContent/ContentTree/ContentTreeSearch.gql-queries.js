import gql from 'graphql-tag';

// One aliased nodesByCriteria per matchable content type, since the API's nodeType criteria takes
// a single type - matches every type the pages tree can show (jnt:page, jnt:navMenuText for menu
// titles, jnt:nodeLink for internal links, jnt:externalLink for external links) in a single query.
//
// nodeConstraint is passed as a variable (built in ContentTreeSearch.utils.js) rather than
// templated from a scalar $searchTerm, since an unaccented search term expands into an `any` list
// of one `like` pattern per plausible accented spelling.
export const SearchTreeNodesQuery = gql`
    query searchTreeNodesByTitle($rootPath: String!, $nodeConstraint: InputGqlJcrNodeConstraintInput!, $language: String!, $limit: Int) {
        jcr {
            pages: nodesByCriteria(
                criteria: {
                    nodeType: "jnt:page"
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: $nodeConstraint
                }
                limit: $limit
            ) {
                nodes {
                    uuid
                    path
                }
            }
            menuTitles: nodesByCriteria(
                criteria: {
                    nodeType: "jnt:navMenuText"
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: $nodeConstraint
                }
                limit: $limit
            ) {
                nodes {
                    uuid
                    path
                }
            }
            internalLinks: nodesByCriteria(
                criteria: {
                    nodeType: "jnt:nodeLink"
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: $nodeConstraint
                }
                limit: $limit
            ) {
                nodes {
                    uuid
                    path
                }
            }
            externalLinks: nodesByCriteria(
                criteria: {
                    nodeType: "jnt:externalLink"
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: $nodeConstraint
                }
                limit: $limit
            ) {
                nodes {
                    uuid
                    path
                }
            }
        }
    }
`;
