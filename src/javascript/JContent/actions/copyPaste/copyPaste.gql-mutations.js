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
    }`
};

export default copyPasteQueries;
