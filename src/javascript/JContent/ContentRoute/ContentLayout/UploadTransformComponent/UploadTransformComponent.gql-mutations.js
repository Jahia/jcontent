import gql from 'graphql-tag';

export const CreateFolders = gql`
    mutation CreateFolders($nodes: [InputJCRNodeWithParent]!) {
        jcr {
            addNodesBatch(nodes: $nodes) {
                node {
                    uuid
                    path
                    workspace
                }
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

