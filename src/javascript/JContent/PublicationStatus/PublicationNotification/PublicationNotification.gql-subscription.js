import gql from 'graphql-tag';

export const SubscribeToPublicationData = gql`
  subscription SubscribeToPublicationData {
      backgroundJobSubscription(filterByGroups:["PublicationJob"]) {
        name
        publicationJob {
          language
          jobStatus
          jobState
        }
  }
}
`;
