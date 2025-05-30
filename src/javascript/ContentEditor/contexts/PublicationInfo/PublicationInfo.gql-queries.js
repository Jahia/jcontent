import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const PublicationInfoQuery = gql`
    query getNodePublicationProperties($uuid:String!, $language:String!) {
        jcr {
            nodeById(uuid: $uuid) {
                ...NodeCacheRequiredFields
                aggregatedPublicationInfo(language: $language, subNodes: false, references: false) {
                    publicationStatus
                    existsInLive
                }
                lastModifiedBy:property(name:"jcr:lastModifiedBy", language: $language){
                    value
                }
                lastModified:property(name:"jcr:lastModified", language: $language){
                    value
                }
                lastPublishedBy:property(name:"j:lastPublishedBy", language: $language){
                    value
                }
                lastPublished:property(name:"j:lastPublished", language: $language){
                    value
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

