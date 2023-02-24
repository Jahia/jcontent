import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

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

export {MarkForDeletionMutation, DeleteMutation};
