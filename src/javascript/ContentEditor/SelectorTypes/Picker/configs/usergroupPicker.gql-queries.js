import gql from 'graphql-tag';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler.gql-queries';

export const UserGroupPickerSearchQuery = gql`
    query userGroupPickerSearchQuery($siteKey:String!, $scopePath:String!, $searchTerm:String, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcontent {
            groupSearch(siteKey: $siteKey, scopePath: $scopePath, searchTerm: $searchTerm, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
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

export const UserGroupPickerFragment = {
    gql: gql`
        fragment UserGroupPickerFragment on JCRNode {
            siteInfo: site {
                ...NodeCacheRequiredFields
                displayName(language: $language)
            }
            userGroupFolderAncestors: ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", value: "jnt:groupsFolder", evaluation: EQUAL}}) {
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
