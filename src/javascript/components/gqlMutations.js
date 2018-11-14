import gql from "graphql-tag";

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
    }`,
};

export {lockMutations}