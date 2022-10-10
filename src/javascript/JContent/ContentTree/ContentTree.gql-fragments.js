import gql from 'graphql-tag';

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: 'node',
        gql: gql`fragment MixinTypes on JCRNode {
            mixinTypes {
                name
            }
        }`
    },
    isPublished: {
        applyFor: 'node',
        variables: {
            language: 'String!'
        },
        gql: gql`fragment PublicationStatus on JCRNode {
            publicationStatus: aggregatedPublicationInfo(language: $language) {
                publicationStatus
            }
        }`
    },
    primaryNodeType: {
        applyFor: 'node',
        gql: gql`fragment PrimaryNodeTypeName on JCRNode {
            primaryNodeType {
                name
                icon
            }
        }`
    }
};

export {PickerItemsFragment};
