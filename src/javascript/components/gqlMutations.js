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

export { publishNode, deleteNode };