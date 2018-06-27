import gql from "graphql-tag";

const allContentQuery = gql`
  {
  jcr {
      nodesByCriteria(criteria: {nodeType:"jnt:content"}) {
          nodes {
              path
              uuid
              displayName
              createdBy: property(name:"jcr:createdBy") {
                  value
              }
              created: property(name:"jcr:created") {
                  value
              }
              primaryNodeType {
                  name
              }
          }
      }
  }
}`;

export {allContentQuery};