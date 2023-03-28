import gql from 'graphql-tag';

const MarkForDeletionMutation = gql`
    mutation MarkForDeletionMutation($path: String!) {
    jcr {
        markNodeForDeletion(pathOrId: $path) 
    }
}
`;

const DeleteMutation = gql`
    mutation DeleteMutation($path: String!) {
        jcr {
            deleteNode(pathOrId: $path)
        }
    }
`;

const UndeleteMutation = gql`
    mutation DeleteMutation($path: String!) {
        jcr {
            unmarkNodeForDeletion(pathOrId: $path)
        }
    }
`;

export {MarkForDeletionMutation, DeleteMutation, UndeleteMutation};
