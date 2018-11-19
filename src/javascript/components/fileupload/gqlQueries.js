import gql from "graphql-tag";

const UploadRequirementsQuery = gql`
    query UploadRequirementsQuery($path:String!, $permission:String!) {
        jcr {
            nodeByPath(path:$path) {
                hasPermission(permissionName: $permission)
            }
        }
    }`;

export { UploadRequirementsQuery }