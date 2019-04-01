import gql from 'graphql-tag';

const CreateFolderMutation = gql`
    mutation CreateFolderMutation($parentPath: String!, $folderName: String!, $primaryNodeType: String!) {
        jcr {
            addNode(parentPathOrId: $parentPath, name: $folderName, primaryNodeType: $primaryNodeType) {
                node {
                    name
                    path
                }
            }
        }
    }
`;

export {CreateFolderMutation};
