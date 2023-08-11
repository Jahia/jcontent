import gql from 'graphql-tag';

export const SubscribeToPublicationData = gql`
  subscription SubscribeToPublicationData($userKeys:[String]!) {
      backgroundJobSubscription(filterByGroups:["PublicationJob"] filterByUserKey:$userKeys) {
        name
        publicationJob {
          language
          jobStatus
          jobState
        }
  }
}
`;
