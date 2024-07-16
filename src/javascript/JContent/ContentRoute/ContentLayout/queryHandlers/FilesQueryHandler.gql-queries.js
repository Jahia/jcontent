import gql from 'graphql-tag';

export const imageFields = {
    gql: gql`
        fragment ImageNodeFields on JCRNode {
            isFile: isNodeType(type: {types: ["jnt:file"]})
            width: property(name: "j:width") {
                value
            }
            height: property(name: "j:height") {
                value
            }
            title: property(name: "jcr:title", language: $language) {
                value
            }
            content: descendant(relPath: "jcr:content") {
                ...NodeCacheRequiredFields
                data: property(name: "jcr:data") {
                    size
                }
                mimeType: property(name: "jcr:mimeType") {
                    value
                }
            }
            thumbnailUrl(name: "thumbnail", checkIfExists: true)
        }
    `,
    applyFor: 'node'
};
