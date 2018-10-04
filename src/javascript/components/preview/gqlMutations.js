import gql from "graphql-tag";

const lockNode = gql`mutation lockNode($pathOrId: String!) {
    jcr {
        mutateNode(pathOrId: $pathOrId) {
          lock
    }
  }
}`;

const unlockNode = gql`mutation unlockNode($pathOrId: String!) {
    jcr {
        mutateNode(pathOrId: $pathOrId) {
          unlock
    }
  }
}`;

const clearAllLocks = gql`mutation clearAllLocks($pathOrId: String!) {
    jcr {
        mutateNode(pathOrId: $pathOrId) {
            clearAllLocks
        }
    }
}`;

export { lockNode, unlockNode, clearAllLocks };