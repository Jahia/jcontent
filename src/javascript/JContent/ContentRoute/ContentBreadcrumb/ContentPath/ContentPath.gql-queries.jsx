import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetContentPath = gql`
    query getContentPath($path:String!, $language: String!) {
        jcr {
            node: nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                ancestors(fieldFilter: {
                    filters: [
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "rep:root"},
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "jnt:virtualsitesFolder"},
                        {evaluation: DIFFERENT, fieldName: "primaryNodeType.name", value: "jnt:virtualsite"}
                    ]
                }) {
                    uuid
                    path
                    displayName(language: $language)
                    primaryNodeType {
                        name
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
