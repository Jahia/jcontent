import gql from "graphql-tag";

const allContentQuery = gql`
  {
  jcr {
    nodesByCriteria(criteria: {nodeType:"jnt:content"}) {
      nodes {
        path
        uuid
        displayName
      }
    }
  }
}`;

export {allContentQuery};