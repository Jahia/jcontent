import gql from 'graphql-tag';

/**
 * Builds the mutation publishing the (node, language) pairs needing publication, with one aliased mutateNode per node.
 * UUIDs and language codes come from the JCR and are inlined as literals, as GraphQL variables cannot hold a
 * dynamic number of values.
 *
 * @param {array} nodeGroups one entry per node ({uuid, languages}), as returned by groupPairsByNode
 * @returns {object} the mutation document
 */
export const buildPublishMutation = nodeGroups => gql`
    mutation publishNonBlockedPairs($includeSubTree: Boolean!) {
        jcr {
            ${nodeGroups.map((nodeGroup, index) => `
            node_${index}: mutateNode(pathOrId: "${nodeGroup.uuid}") {
                publish(languages: ${JSON.stringify(nodeGroup.languages)}, includeSubTree: $includeSubTree)
            }`).join('')}
        }
    }
`;
