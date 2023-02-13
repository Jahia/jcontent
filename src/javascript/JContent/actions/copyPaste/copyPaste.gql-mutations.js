import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const copyPasteQueries = {
    pasteNode: gql`mutation pasteNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String) {
        jcr {
            pasteNode(mode: COPY, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, destName: $destName, namingConflictResolution: RENAME) {
                node {
                    ...NodeCacheRequiredFields
                    path
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    `,

    moveNode: gql`mutation moveNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String) {
        jcr {
            pasteNode(mode: MOVE, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, destName: $destName, namingConflictResolution: RENAME) {
                node {
                    ...NodeCacheRequiredFields
                    path
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    `,

    pasteNodes: gql`mutation pasteNodes($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                clearAllLocks
            }
        }
    }`,

    pasteReferenceNode: gql`mutation pasteReferenceNode($pathOrId: String!, $destParentPathOrId: String!, $destName: String!, $referenceType: String!) {
        jcr {
            pasteNode: addNode(name: $destName, primaryNodeType: $referenceType, parentPathOrId: $destParentPathOrId, useAvailableNodeName: true) {
                mutateProperty(name: "j:node") {
                    setValue(value: $pathOrId)
                }
                node {
                    ...NodeCacheRequiredFields
                    path
                }
            }
        }
    }

    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    `

};

export default copyPasteQueries;
