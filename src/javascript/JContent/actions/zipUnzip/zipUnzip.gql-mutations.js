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
                }`,
    unzip: gql`mutation unzipFile($pathOrId: String!, $path: String!) {
                jcr {
                    mutateNode(pathOrId: $pathOrId) {
                        zip {
                            unzip(path: $path)
                        }
                    }
                }
            }`
};

export default zipUnzipMutations;
