import gql from 'graphql-tag';

export const CheckNodeFolder = gql`
    query CheckNodeFolder($paths: [String!]!) {
        jcr {
            nodesByPath(paths:$paths) {
                uuid
                workspace
                path
                isNodeType(type: {types: "jnt:folder"} )
            }
        }
        
    }
`;

export const UploadRequirementsQuery = gql`
    query UploadRequirementsQuery($path:String!, $permission:String!, $sitePermission:String!, $permittedNodeTypes:[String!]!) {
        jcr {
            results: nodeByPath(path:$path) {
                uuid
                workspace
                path
                hasPermission(permissionName: $permission)
                acceptsFiles: isNodeType(type:{multi:ANY, types:$permittedNodeTypes})
                site {
                    uuid
                    workspace
                    hasPermission(permissionName: $sitePermission)
                }
            }
        }
    }`;

