import gql from "graphql-tag";

const publishNode = gql`mutation($pathOrId: String!) {
  jcr {
    mutateNode(pathOrId: $pathOrId) {
      publish
    }
  }
}`;

const deleteNode = gql`mutation ($pathOrId: String!) {
    jcr {
        deleteNode(pathOrId: $pathOrId)
  }
}`;

export { publishNode, deleteNode };