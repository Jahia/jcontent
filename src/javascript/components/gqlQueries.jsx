import gql from "graphql-tag";

const TableQueryVariables = (props) => ({
    lang: props.lang,
    offset: props.page,
    limit: props.rowsPerPage,
    filterText: props.filterText,
    doFilter: !!props.filterText
});

const allContentQuery = gql`

query($offset:Int, $limit:Int){
  jcr {
    nodesByCriteria(criteria: {nodeType: "jnt:content", paths:["/sites/digitall"]}, offset: $offset, limit: $limit) {
    pageInfo{
        totalCount
        }
      nodes {
        name
        path
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

export {allContentQuery, TableQueryVariables};