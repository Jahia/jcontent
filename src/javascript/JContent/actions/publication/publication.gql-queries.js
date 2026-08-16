import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {getAliasForLanguage} from './getPublicationDecision';

/**
 * Builds the publication pre-flight query, with one aliased aggregatedPublicationInfo per target language.
 * Language codes come from the site configuration and are inlined as literals, as GraphQL variables cannot
 * hold a dynamic number of values.
 *
 * @param {array} languages the target language codes
 * @returns {object} the query document
 */
export const buildPreflightQuery = languages => gql`
    query publicationPreflight($uuids: [String!]!, $displayLanguage: String!, $subNodes: Boolean!) {
        jcr {
            nodesById(uuids: $uuids) {
                ...NodeCacheRequiredFields
                path
                displayName(language: $displayLanguage)
                ${languages.map(language => `
                ${getAliasForLanguage(language)}: aggregatedPublicationInfo(language: "${language}", subNodes: $subNodes) {
                    publicationStatus
                    allowedToPublishWithoutWorkflow
                }`).join('')}
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
