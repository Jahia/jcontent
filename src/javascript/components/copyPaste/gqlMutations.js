import gql from "graphql-tag";

const pasteNode = gql`mutation pasteNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String) {
    jcr {
        pasteNode(mode: COPY, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, destName: $destName, namingConflictResolution: RENAME) {
            node {
                path
            }
        }
    }
}`;

const pasteNodes = gql`mutation pasteNodes($pathOrId: String!) {
    jcr {
        mutateNode(pathOrId: $pathOrId) {
            clearAllLocks
        }
    }
}`;

export { pasteNode, pasteNodes };