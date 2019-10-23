import gql from 'graphql-tag';

const zipUnzipMutations = {
    zip: gql`mutation zipFile($parentPathOrId: String!, $name: String!, $paths: [String!]!) {
                            jcr {
                                addNode(parentPathOrId: $parentPathOrId, name: $name, primaryNodeType:"jnt:file") {
                                    zip {
                                        addToZip(pathsOrIds: $paths)
                                    }
                                }
                            }
                        }`
};

export default zipUnzipMutations;
