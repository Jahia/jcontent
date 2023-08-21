import gql from 'graphql-tag';
import {QueryHandlersFragments} from './BaseQueryHandler.gql-queries';

export const SearchQuery = gql`
    query searchContentQuery($searchPath:String!, $nodeType:String!, $searchTerms:String!, $nodeNameSearchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldFilter: InputFieldFiltersInput, $fieldSorter: InputFieldSorterInput, $doSearch: Boolean!) {
        jcr {
            nodesByCriteria(
                criteria: {
                    language: $language,
                    nodeType: $nodeType,
                    paths: [$searchPath],
                    nodeConstraint: {
                        any: [
                            {contains: $searchTerms}
                            {contains: $searchTerms, property: "j:tagList"}
                            {like: $nodeNameSearchTerms, property: "j:nodename"}
                        ]
                    }
                },
                fieldFilter: $fieldFilter
                offset: $offset,
                limit: $limit,
                fieldSorter: $fieldSorter
            ) @include(if: $doSearch) {
                pageInfo {
                    totalCount
                }
                nodes {
                    ...NodeFields
                    ...node
                }
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
`;
