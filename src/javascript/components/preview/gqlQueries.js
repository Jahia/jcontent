import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";

const previewQuery = gql`query previewQuery($path:String!, $templateType: String!, $view: String!, $contextConfiguration: String!) {
    jcr {
        nodeByPath(path:$path) {
            id : uuid
            isFile:isNodeType(type: {types: ["jnt:file"]})
            path
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration) {
                output
                staticAssets(type:"css") {
                    key
                }
            }
            ...NodeCacheRequiredFields
        }
    }
  }${PredefinedFragments.nodeCacheRequiredFields.gql}`;
export { previewQuery }