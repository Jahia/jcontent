import gql from 'graphql-tag';

const uploadFile = gql`mutation uploadFile($nameInJCR: String!, $path: String!, $mimeType: String!, $fileHandle: String!) {
    jcr {
        addNode(name:$nameInJCR, parentPathOrId:$path, primaryNodeType:"jnt:file") {
            addChild(name:"jcr:content", primaryNodeType:"jnt:resource") {
                content: mutateProperty(name:"jcr:data") {
                    setValue(type:BINARY, value:$fileHandle)
                }
                contentType: mutateProperty(name:"jcr:mimeType") {
                    setValue(value:$mimeType)
                }
            }
        }
    }
}`;

const updateFileContent = gql`mutation updateFileContent($path: String!, $mimeType: String!, $fileHandle: String!) {
    jcr {
        mutateNode(pathOrId:$path) {
            mutateChildren(names:["jcr:content"]) {
                content: mutateProperty(name:"jcr:data") {
                    setValue(type:BINARY, value:$fileHandle)
                }
                contentType: mutateProperty(name:"jcr:mimeType") {
                    setValue(value:$mimeType)
                }
            }
        }
    }
}`;

const importContent = gql`mutation importContent($path: String!, $fileHandle: String!){
    jcr {
        importNode(parentPathOrId: $path, file: $fileHandle)
    }
}`;

export {uploadFile, updateFileContent, importContent};
