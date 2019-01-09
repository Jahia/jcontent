import gql from 'graphql-tag';

const pasteMutations = {
    pasteNode: gql`mutation pasteNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String) {
        jcr {
            pasteNode(mode: COPY, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, destName: $destName, namingConflictResolution: RENAME) {
                node {
                    path
                }
            }
        }
    }`,

    moveNode: gql`mutation moveNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String) {
        jcr {
            pasteNode(mode: MOVE, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, destName: $destName, namingConflictResolution: RENAME) {
                node {
                    path
                }
            }
        }
    }`,

    pasteNodes: gql`mutation pasteNodes($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                clearAllLocks
            }
        }
    }`
};

export default pasteMutations;
