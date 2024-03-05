import gql from 'graphql-tag';

export const SubscribeToPublicationData = gql`
    subscription SubscribeToPublicationData {
        subscribeToPublicationJob {
            state
            language
            paths
            user
            siteKey
        }
    }
`;
