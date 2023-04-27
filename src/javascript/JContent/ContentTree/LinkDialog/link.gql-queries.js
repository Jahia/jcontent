import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetLinkData = gql`
    query getLinkData($path: String!, $language: String!) {
        jcr {
            nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                internalLink: property(name: "j:node") {
                    refNode {
                        ...NodeCacheRequiredFields
                        displayName(language: $language)
                        path
                    }
                }
                externalLink: property(name:"j:url") {
                    value
                }
            }
        }
    }

    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
