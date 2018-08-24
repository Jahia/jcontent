import gql from "graphql-tag";

const publishNode = gql`mutation publishNode($pathOrId: String!, $languages: [String]!) {
  jcr {
    mutateNode(pathOrId: $pathOrId) {
      publish(languages: $languages)
    }
  }
}`;

const deleteNode = gql`mutation deleteNode($pathOrId: String!) {
    jcr {
        deleteNode(pathOrId: $pathOrId)
  }
}`;

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

export { publishNode, deleteNode, lockNode, unlockNode, clearAllLocks };