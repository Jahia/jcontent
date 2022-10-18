import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const FileInfoQuery = gql`
    query FileInfoQuery($path:String!, $language:String!) {
        jcr {
            nodeByPath(path: $path) {
                name
                path
                primaryNodeType {
                    name
                }
                aggregatedPublicationInfo(language: $language) {
                    existsInLive
                }
                isFile: isNodeType(type: {types: ["jnt:file"]})
                isImage: isNodeType(type: {types: ["jmix:image"]})
                width: property(name: "j:width") {
                    value
                }
                height: property(name: "j:height") {
                    value
                }
                displayName(language: $language)
                content: descendant(relPath: "jcr:content") {
                    ...NodeCacheRequiredFields
                    data: property(name: "jcr:data") {
                        size
                    }
                    mimeType: property(name: "jcr:mimeType") {
                        value
                    }
                }
                parent {
                    name
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export const FileInfoQueryLive = gql`
    query FileInfoQueryLive($uuid:String!, $language:String!) {
        jcr(workspace:LIVE) {
            nodeById(uuid: $uuid) {
                name
                path
                primaryNodeType {
                    name
                }
                isFile: isNodeType(type: {types: ["jnt:file"]})
                isImage: isNodeType(type: {types: ["jmix:image"]})
                width: property(name: "j:width") {
                    value
                }
                height: property(name: "j:height") {
                    value
                }
                displayName(language: $language)
                content: descendant(relPath: "jcr:content") {
                    ...NodeCacheRequiredFields
                    data: property(name: "jcr:data") {
                        size
                    }
                    mimeType: property(name: "jcr:mimeType") {
                        value
                    }
                }
                parent {
                    name
                        ...NodeCacheRequiredFields
                    }
                    ...NodeCacheRequiredFields
                }
            }
        }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
