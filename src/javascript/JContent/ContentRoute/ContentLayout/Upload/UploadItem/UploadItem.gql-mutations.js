import gql from 'graphql-tag';

const uploadFile = gql`mutation uploadFile($nameInJCR: String!, $path: String!, $mimeType: String!, $fileHandle: String!, $isImage: Boolean!) {
    jcr {
        addNode(name: $nameInJCR, parentPathOrId: $path, primaryNodeType: "jnt:file") {
            addChild(name: "jcr:content", primaryNodeType: "jnt:resource") {
                content: mutateProperty(name: "jcr:data") {
                    setValue(type: BINARY, value: $fileHandle)
                }
                contentType: mutateProperty(name: "jcr:mimeType") {
                    setValue(value: $mimeType)
                }

            }
            addMixins(mixins: ["jmix:image"]) @include(if: $isImage)
            awsRecognition @include(if: $isImage) {
                tagImageSync
            }
        }
    }
}`;

const updateFileContent = gql`mutation updateFileContent($path: String!, $mimeType: String!, $fileHandle: String!, $isImage: Boolean!) {
    jcr {
        mutateNode(pathOrId: $path) {
            mutateChildren(names: ["jcr:content"]) {
                content: mutateProperty(name: "jcr:data") {
                    setValue(type: BINARY, value: $fileHandle)
                }
                contentType: mutateProperty(name: "jcr:mimeType") {
                    setValue(value: $mimeType)
                }
            }
            awsRecognition @include(if: $isImage) {
                tagImageSync
            }  
        }
    }
}`;

const importContent = gql`mutation importContent($path: String!, $fileHandle: String!) {
    jcr {
        importContent(parentPathOrId: $path, file: $fileHandle)
    }
}`;

export {uploadFile, updateFileContent, importContent};
