import gql from 'graphql-tag';

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: 'node',
        gql: gql`fragment PickerMixinTypes on JCRNode {
            mixinTypes {
                name
            }
            isMainResource: isNodeType(type: {types: "jmix:mainResource"})
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
        gql: gql`fragment PickerPrimaryNodeTypeName on JCRNode {
            primaryNodeType {
                name
                icon
            }
        }`
    },
    parentNode: {
        variables: {
            language: 'String!'
        },
        applyFor: 'node',
        gql: gql`fragment ParentNodeWithName on JCRNode {
            parent {
                path
                displayName(language:$language)
                primaryNodeType {
                    name
                }
                name
                ...NodeCacheRequiredFields
            }
        }`
    }
};

export {PickerItemsFragment};
