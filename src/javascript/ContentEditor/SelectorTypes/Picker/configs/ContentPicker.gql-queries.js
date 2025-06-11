import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const ContentPickerFilledQuery = gql`
    query contentPickerFilledQuery($uuids: [String!]!, $language: String!, $uiLanguage: String!) {
        jcr {
            result: nodesById(uuids: $uuids) {
                displayName(language: $language)
                name
                primaryNodeType {
                    name
                    displayName(language: $uiLanguage)
                    icon
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
