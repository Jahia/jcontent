import gql from 'graphql-tag';

export const contentStatusFragment = {
    applyFor: 'node',
    gql: gql`fragment ContentStatus on JCRNode {
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
    }`
};
