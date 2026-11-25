import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const PreviewNodeFields = gql`
    fragment PreviewNodeFields on JCRNode {
        id: uuid
        isFile: isNodeType(type: {types: ["jnt:file"]})
        path
        lastModified: property(name: "jcr:lastModified", language: $language) {
            value
        }
        renderedContent(
            templateType: $templateType,
            view: $view,
            contextConfiguration: $contextConfiguration,
            language: $language,
            requestAttributes: $requestAttributes,
            mainResourcePath: $mainResourcePath
        ) {
            output
            staticAssets(type: "css") {
                key
            }
        }
        ...NodeInfoResourceNode
        ...NodeCacheRequiredFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${PredefinedFragments.mimeTypes.gql}
`;

export const CONTENT_PREVIEW_QUERY = gql`
    query previewQueryByWorkspace(
        $path: String!, 
        $templateType: String!, 
        $view: String, 
        $contextConfiguration: String!, 
        $language: String!, 
        $workspace: Workspace!, 
        $requestAttributes: [InputRenderRequestAttributeInput],
        $mainResourcePath: String
    ) {
        jcr(workspace: $workspace) {
            nodeByPath(path: $path) {
                ...PreviewNodeFields
            }
        }
    }
    ${PreviewNodeFields}
`;

// The server shows the unsaved values of the form on their node, and renders every other node as it is stored.
export const CONTENT_PREVIEW_UNSAVED_VALUES_QUERY = gql`
    query previewQueryWithUnsavedValues(
        $path: String!,
        $templateType: String!,
        $view: String,
        $contextConfiguration: String!,
        $language: String!,
        $workspace: Workspace!,
        $requestAttributes: [InputRenderRequestAttributeInput],
        $mainResourcePath: String,
        $unsavedValues: InputJCRUnsavedValues!
    ) {
        jcr(workspace: $workspace, unsavedValues: $unsavedValues) {
            nodeByPath(path: $path) {
                ...PreviewNodeFields
            }
        }
    }
    ${PreviewNodeFields}
`;
