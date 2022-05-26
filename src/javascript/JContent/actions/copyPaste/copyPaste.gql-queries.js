import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const copyPasteQueries = gql`query getClipboardInfo($uuids: [String!]!) {
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
                        ...NodeCacheRequiredFields
                    }
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    `;

export default copyPasteQueries;
