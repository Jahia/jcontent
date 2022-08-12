import gql from 'graphql-tag';
import {nodeFields} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler.gql-queries';

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
    ${nodeFields}
`;
