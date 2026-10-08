import gql from 'graphql-tag';

export const UserPickerSearchQuery = gql`
    query userPickerSearchQuery($siteKey:String!, $scopePath:String!, $searchTerm:String, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcontent {
            userSearch(siteKey: $siteKey, scopePath: $scopePath, searchTerm: $searchTerm, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                pageInfo {
                    totalCount
                }
                nodes {
                    uuid
                    path
                    name
                    displayName
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

export const UserPickerFragment = {
    gql: gql`
        fragment UserPickerFragment on JCRNode {
            firstName: property(name: "j:firstName") {
                value
            }
            lastName: property(name: "j:lastName") {
                value
            }
            siteInfo: site {
                ...NodeCacheRequiredFields
                displayName(language: $language)
            }
            userFolderAncestors: ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", value: "jnt:usersFolder", evaluation: EQUAL}}) {
                ...NodeCacheRequiredFields
                name
                primaryNodeType {
                    name
                }
            }
        }
    `,
    applyFor: 'node'
};
