import gql from 'graphql-tag';

export const GetContentHistoryQuery = gql`
    query getNodeHistory($path: String!, $withLanguageNodes: Boolean!, $action: String, $offset: Int!, $limit: Int!, $uiLanguage: String!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
                history {
                    count(withLanguageNodes: $withLanguageNodes, action: $action)
                    entries(withLanguageNodes: $withLanguageNodes, action: $action, offset: $offset, limit: $limit) {
                        id
                        date
                        path
                        uuid
                        action
                        nodeName
                        nodeNameDisplay(language: $uiLanguage)
                        propertyName
                        propertyNameDisplay(language: $uiLanguage)
                        userKey
                        user {
                            username
                            firstname
                            lastname
                            displayName
                        }
                        message
                        language
                    }
                }
            }
        }
    }
`;
