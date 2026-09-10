import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

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
                id: uuid
                isFile: isNodeType(type: {types: ["jnt:file"]})
                path
                lastModified: property(name: "jcr:lastModified", language: $language) {
                    value
                }
                # Existence probes only - the URLs are rebuilt with a lastModified cache buster,
                # the same way the media grid cards do it
                hasThumbnail3: thumbnailUrl(name: "thumbnail3", checkIfExists: true)
                hasThumbnail2: thumbnailUrl(name: "thumbnail2", checkIfExists: true)
                hasThumbnail: thumbnailUrl(name: "thumbnail", checkIfExists: true)
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
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${PredefinedFragments.mimeTypes.gql}
`;
