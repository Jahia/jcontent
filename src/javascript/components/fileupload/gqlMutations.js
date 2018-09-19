import gql from "graphql-tag";

const uploadFile = gql`mutation uploadImage($fileHandle: String!) {
    jcr {
        addNode(name:"me.jpg", parentPathOrId:"/sites/digitall/files/images/people", primaryNodeType:"jnt:file") {
            addMixins(mixins:["jmix:image", "jmix:exif"])
            addChild(name:"jcr:content", primaryNodeType:"jnt:resource"){
                mutateProperty(name:"jcr:data") {
                    setValue(type:BINARY, value:$fileHandle)
                }
            }
        }
    }
}`;

export { uploadFile }