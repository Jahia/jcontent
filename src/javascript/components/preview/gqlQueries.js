import gql from "graphql-tag";

const previewQuery = gql`query previewQuery($path:String!) {
    jcr {
        nodeByPath(path:$path) {
            renderedContent(templateType:"html", view:"cm", contextConfiguration:"default") {
                output
            }
        }
    }
  }`;

export { previewQuery }