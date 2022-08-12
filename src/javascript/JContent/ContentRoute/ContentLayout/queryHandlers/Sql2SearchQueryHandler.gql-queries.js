import gql from 'graphql-tag';
import {QueryHandlersFragments} from './BaseQueryHandler.gql-queries';

export const Sql2SearchQuery = gql`
    query sql2SearchContentQuery($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcr {
            nodesByQuery(query: $query, queryLanguage: SQL2, language: $language, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
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
