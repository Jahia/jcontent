import gql from "graphql-tag";

const allContentQuery = gql`
  {
  jcr {
    nodesByCriteria(criteria: {nodeType:"jnt:content", paths:["/sites/digitall"]}) {
      nodes {
        path
        uuid
        displayName
      }
    }
  }
}`;

export {allContentQuery};