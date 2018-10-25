import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";

const previewQuery = gql`query previewQueryAllWorkspaces($path:String!, $templateType: String!, $view: String!, $contextConfiguration: String!, $language: String!, $isPublished: Boolean!) {
    live:jcr(workspace: LIVE) @include(if: $isPublished) {
        nodeByPath(path:$path) {
            id : uuid
            isFile:isNodeType(type: {types: ["jnt:file"]})
            path
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration, language: $language) {
                output
                staticAssets(type:"css") {
                    key
                }
            }
            ...NodeCacheRequiredFields
        }
    }
    edit:jcr(workspace: EDIT) {
        nodeByPath(path:$path) {
            id : uuid
            isFile:isNodeType(type: {types: ["jnt:file"]})
            path
            isPublished:property(name:"j:published") {
                name
                value
            }
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration, language: $language) {
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