import gql from "graphql-tag";

const TableQueryVariables = (props, path) => ({
    offset: props.page,
    limit: props.rowsPerPage,
    path: path
});

const allContentQuery = gql`

    query($offset:Int, $limit:Int, $path:String!){
        jcr {
            nodesByCriteria(criteria: {nodeType: "jnt:content", paths:[$path]}, offset: $offset, limit: $limit) {
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