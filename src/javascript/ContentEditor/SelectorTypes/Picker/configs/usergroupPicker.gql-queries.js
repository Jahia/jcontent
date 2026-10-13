import gql from 'graphql-tag';

export const UserGroupPickerSearchQuery = gql`
    query userGroupPickerSearchQuery($siteKey:String!, $scopePath:String!, $searchTerm:String, $language:String, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcontent {
            groupSearch(siteKey: $siteKey, scopePath: $scopePath, searchTerm: $searchTerm, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                pageInfo {
                    totalCount
                }
                nodes {
                    uuid
                    path
                    name
                    displayName(language: $language)
                    nodeTypeName
                    firstName
                    lastName
                    provider
                    siteInfo: site {
                        siteKey
                        displayName
                    }
                }
            }
        }
    }
`;
