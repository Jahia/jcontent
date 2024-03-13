import gql from 'graphql-tag';

export const SubscribeToPublicationData = gql`
    subscription SubscribeToPublicationData($userKeys:[String]!) {
        subscribeToPublicationJob(userKeyFilter:$userKeys) {
            state
            language
            paths
            user
            siteKey
        }
    }
`;
