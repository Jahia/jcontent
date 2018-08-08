import gql from "graphql-tag";

const previewQuery = gql`query previewQuery($path:String!, $templateType: String!, $view: String!, $contextConfiguration: String!) {
    jcr {
        nodeByPath(path:$path) {
            id : uuid
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration) {
                output
                staticAssets(type:"css") {
                    key
                }
            }
        }
    }
  }`;

export { previewQuery }