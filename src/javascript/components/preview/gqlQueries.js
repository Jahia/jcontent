import gql from "graphql-tag";

const previewQuery = gql`query previewQuery($path:String!) {
    jcr {
        nodeByPath(path:$path) {
            id : uuid
            renderedContent(templateType:"html", view:"content-template", contextConfiguration:"page") {
                output
                staticAssets(type:"css") {
                    key
                }
            }
        }
    }
  }`;

export { previewQuery }