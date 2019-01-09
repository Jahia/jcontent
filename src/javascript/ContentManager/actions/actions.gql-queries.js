import gql from 'graphql-tag';

const ContentTypesQuery = gql`
    query ContentTypesQuery($nodeTypes: [String]!) {
        jcr {
            nodeTypesByNames(names: $nodeTypes) {
                name
                supertypes {
                    name
                }
            }
        }
    }
`;

const ContentTypeNamesQuery = gql`
    query ContentTypeNamesQuery($nodeTypes: [String]!, $displayLanguage: String!) {
        jcr {
            nodeTypesByNames(names: $nodeTypes) {
                name,
                displayName(language: $displayLanguage)
            }
        }
    }
`;

export {
    ContentTypesQuery,
    ContentTypeNamesQuery
};
