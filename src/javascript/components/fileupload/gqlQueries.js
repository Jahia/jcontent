import gql from "graphql-tag";

const UploadRequirementsQuery = gql`
    query UploadRequirementsQuery($path:String!, $permission:String!, $permittedNodeTypes:[String!]!) {
        jcr {
            nodeByPath(path:$path) {
                id: uuid
                hasPermission(permissionName: $permission)
                acceptsFiles: isNodeType(type:{multi:ANY, types:$permittedNodeTypes})
            }
        }
    }`;

export { UploadRequirementsQuery }