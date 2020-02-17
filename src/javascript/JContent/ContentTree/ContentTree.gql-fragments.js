import gql from 'graphql-tag';

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: 'node',
        variables: {
            lang: 'String!'
        },
        gql: gql`fragment MixinTypes on JCRNode {
            mixinTypes {
                name
            }
        }`
    },
    isPublished: {
        applyFor: 'node',
        variables: {
            lang: 'String!'
        },
        gql: gql`fragment PublicationStatus on JCRNode {
            publicationStatus: aggregatedPublicationInfo(language: $lang) {
                publicationStatus
            }
        }`
    },
    primaryNodeType: {
        applyFor: 'node',
        gql: gql`fragment PrimaryNodeTypeName on JCRNode {
            primaryNodeType {
                name
            }
        }`
    }
};

export {PickerItemsFragment};
