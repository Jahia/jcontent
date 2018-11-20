import gql from "graphql-tag";

const UploadRequirementsQuery = gql`
    query UploadRequirementsQuery($path:String!, $permission:String!, $permittedNodeTypes:[String!]!) {
        jcr {
            results: nodeByPath(path:$path) {
                uuid
                workspace
                hasPermission(permissionName: $permission)
                acceptsFiles: isNodeType(type:{multi:ANY, types:$permittedNodeTypes})
            }
        }
    }`;

export { UploadRequirementsQuery }