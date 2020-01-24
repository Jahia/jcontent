import gql from 'graphql-tag';

const copyPasteQueries = {
    getClipboardInfo: gql`query getClipboardInfo($uuids: [String!]!) {
        jcr {
            nodesById(uuids: $uuids) {
                name
                path
                uuid
                displayName(language:"en")
                primaryNodeType {
                    name
                    supertypes {
                        name
                    }
                }
                mixinTypes {
                    name
                    supertypes {
                        name
                    }
                }
                referenceNode: property(name: "j:node") {
                    refNode {
                        name
                        path
                        uuid
                        primaryNodeType {
                            name
                            supertypes {
                                name
                            }
                        }
                        mixinTypes {
                            name
                            supertypes {
                                name
                            }
                        }
                    }
                }
            }
        }
    }`
};

export default copyPasteQueries;
