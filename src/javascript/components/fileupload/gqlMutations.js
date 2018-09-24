import gql from "graphql-tag";

const uploadFile = gql`mutation uploadImage($nameInJCR: String!, $path: String!, $fileHandle: String!) {
    jcr {
        addNode(name:$nameInJCR, parentPathOrId:$path, primaryNodeType:"jnt:file") {
            addChild(name:"jcr:content", primaryNodeType:"jnt:resource"){
                mutateProperty(name:"jcr:data") {
                    setValue(type:BINARY, value:$fileHandle)
                }
            }
        }
    }
}`;

const uploadImage = gql`mutation uploadImage($nameInJCR: String!, $path: String!, $mimeType: String!, $fileHandle: String!) {
    jcr {
        addNode(name:$nameInJCR, parentPathOrId:$path, primaryNodeType:"jnt:file") {
            addMixins(mixins:["jmix:image", "jmix:exif"])
            addChild(name:"jcr:content", primaryNodeType:"jnt:resource"){
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

export { uploadFile, uploadImage }