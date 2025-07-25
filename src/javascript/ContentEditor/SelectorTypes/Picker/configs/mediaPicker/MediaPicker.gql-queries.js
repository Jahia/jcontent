import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const MediaPickerFilledQuery = gql`
    query mediaPickerFilledQuery($uuids: [String!]!, $language: String!) {
        jcr {
            result: nodesById(uuids: $uuids) {
                displayName(language: $language)
                title: property(language: $language, name: "jcr:title"){value}
                name
                width: property(name: "j:width") {
                    value
                }
                height: property(name: "j:height") {
                    value
                }
                content: descendant(relPath: "jcr:content") {
                    ...NodeCacheRequiredFields
                    data: property(name: "jcr:data") {
                        size
                    }
                    mimeType: property(name: "jcr:mimeType") {
                        value
                    }
                }
                thumbnailUrl(name: "thumbnail2", checkIfExists: true) 
                lastModified: property(name: "jcr:lastModified") {
                    value
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {MediaPickerFilledQuery};
