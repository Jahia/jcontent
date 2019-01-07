import gql from 'graphql-tag';

const lockMutations = {
    lock: gql`mutation lockNode($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                lock
            }
        }
    }`,
    unlock: gql`mutation unlockNode($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                unlock
            }
        }
    }`,
    clearAllLocks: gql`mutation clearAllLocks($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                clearAllLocks
            }
        }
    }`
};

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

export {lockMutations, pasteMutations};
