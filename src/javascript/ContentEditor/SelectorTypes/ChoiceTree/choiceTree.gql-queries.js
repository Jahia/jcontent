import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetTreeEntries = gql`
    query getTreeEntries($path: String!, $types: [String]!, $language: String!) {
        jcr {
            result: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                value: uuid
                label: displayName(language: $language)
                descendants(typesFilter: {types: $types}) {
                    nodes {
                      ...NodeCacheRequiredFields
                      value: uuid
                      label: displayName(language: $language)
                      parent {
                        ...NodeCacheRequiredFields
                        uuid
                      }
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}`;
