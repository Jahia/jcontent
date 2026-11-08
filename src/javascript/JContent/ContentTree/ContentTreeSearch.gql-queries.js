import gql from 'graphql-tag';

// One aliased nodesByCriteria per matchable content type, since the API's nodeType criteria takes
// a single type - matches every type the pages tree can show (jnt:page, jnt:navMenuText for menu
// titles, jnt:nodeLink for internal links, jnt:externalLink for external links) in a single query.
//
// Each alias carries the same four-clause nodeConstraint, scoped to the title and the system name
// only - never the whole node. The four clauses are not redundant, because `contains` and `like`
// read two different stores:
//
//   - `contains` reads the Lucene index, whose text is lowercased, accent-folded, stemmed and
//     tokenized. $searchTerm is analyzed, so it matches complete words whatever their accents.
//   - $wildcardTerm is NOT analyzed (a term carrying `*` skips the analyzer), so it catches a
//     substring - and it matches the STEM, which is why the analyzed clause has to sit beside it.
//   - `like` reads the raw stored value, folding nothing, so it catches what the analyzer altered
//     or dropped, and it is the ONLY clause that can reach the system name: a property-scoped
//     `contains` on j:nodename never matches, because the node name reaches the aggregated node
//     text and not its own full-text field.
//
// PATH is deliberately absent. There is no path operand in JCR QOM, and a `like` on j:fullpath or
// jcr:path was measured to return nothing. The route that does work is two steps: match
// j:nodename to find the ancestor, then issue a second nodesByCriteria with paths: [thoseAncestors],
// pathType: ANCESTOR and no nodeConstraint to collect its descendants.
export const SearchTreeNodesQuery = gql`
    query searchTreeNodes($rootPath: String!, $searchTerm: String!, $wildcardTerm: String!, $likePattern: String!, $language: String!, $limit: Int) {
        jcr {
            pages: nodesByCriteria(
                criteria: {
                    nodeType: "jnt:page"
                    language: $language
                    paths: [$rootPath]
                    pathType: ANCESTOR
                    nodeConstraint: {
                        any: [
                            {contains: $searchTerm, property: "jcr:title"}
                            {contains: $wildcardTerm, property: "jcr:title"}
                            {like: $likePattern, property: "jcr:title", function: LOWER_CASE}
                            {like: $likePattern, property: "j:nodename", function: LOWER_CASE}
                        ]
                    }
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
                    nodeConstraint: {
                        any: [
                            {contains: $searchTerm, property: "jcr:title"}
                            {contains: $wildcardTerm, property: "jcr:title"}
                            {like: $likePattern, property: "jcr:title", function: LOWER_CASE}
                            {like: $likePattern, property: "j:nodename", function: LOWER_CASE}
                        ]
                    }
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
                    nodeConstraint: {
                        any: [
                            {contains: $searchTerm, property: "jcr:title"}
                            {contains: $wildcardTerm, property: "jcr:title"}
                            {like: $likePattern, property: "jcr:title", function: LOWER_CASE}
                            {like: $likePattern, property: "j:nodename", function: LOWER_CASE}
                        ]
                    }
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
                    nodeConstraint: {
                        any: [
                            {contains: $searchTerm, property: "jcr:title"}
                            {contains: $wildcardTerm, property: "jcr:title"}
                            {like: $likePattern, property: "jcr:title", function: LOWER_CASE}
                            {like: $likePattern, property: "j:nodename", function: LOWER_CASE}
                        ]
                    }
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
