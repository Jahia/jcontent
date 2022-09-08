import gql from 'graphql-tag';

export const imageFields = {
    gql: gql`
        fragment ImageNodeFields on JCRNode {
            isFile: isNodeType(type: {types: ["jnt:file", "jmix:image"]})
            width: property(name: "j:width") {
                value
            }
            height: property(name: "j:height") {
                value
            }
            children(typesFilter: {types: ["jnt:resource"]}) {
                nodes {
                    ...NodeCacheRequiredFields
                    data: property(name: "jcr:data") {
                        size
                    }
                    mimeType: property(name: "jcr:mimeType") {
                        value
                    }
                }
            }
        }
    `,
    applyFor: 'node'
};

