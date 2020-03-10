import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetContentStatuses = gql`
    query getContentStatuses($path: String!, $language: String!) {
        jcr {
            result: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                aggregatedPublicationInfo(language: $language) {
                    publicationStatus
                }
                lastModifiedBy: property(name: "jcr:lastModifiedBy", language: $language) {
                    value
                }
                lastModified: property(name: "jcr:lastModified", language: $language) {
                    value
                }
                lastPublished: property(name: "j:lastPublished", language: $language) {
                    value
                }
                lastPublishedBy: property(name: "j:lastPublishedBy", language: $language) {
                    value
                }
                deletedBy: property(name: "j:deletionUser", language: $language) {
                    value
                }
                deleted: property(name: "j:deletionDate", language: $language) {
                    value
                }
                mixinTypes {
                    name
                }
                lockOwner: property(name: "jcr:lockOwner") {
                    value
                }
                lockTypes: property(name: "j:lockTypes") {
                    values
                }                
                wipStatus: property(name: "j:workInProgressStatus") {
                    value
                }
                wipLangs: property(name: "j:workInProgressLanguages") {
                    values
                }
                ancestors(fieldFilter: {filters: {fieldName: "deleted", evaluation: NOT_EMPTY}}) {
                    deleted:property(name: "j:deletionDate") {
                        value
                    }
                    deletedBy: property(name: "j:deletionUser") {
                        value
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}`;
