import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {getAliasForLanguage} from './getPublicationDecision';
import {getPropertiesAliasForLanguage} from './getMissingMandatoryProperties';

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

/**
 * Builds the blocked-details query, executed only when the pre-flight found blocked pairs (the happy path
 * stays at a single round-trip). Per blocked node it fetches:
 * - the site languages (displayName, mandatory flag) used to render the language sections,
 * - the primary node type property definitions, from which the mandatory internationalized candidates are
 *   derived (see getMissingMandatoryProperties: a display-only mirror of the server check
 *   JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale; the blocked verdict itself stays
 *   server-authoritative via aggregatedPublicationInfo),
 * - one aliased localized properties list per blocked language. The property names cannot be filtered
 *   server-side (the candidate list depends on each node's primary node type, unknown before this query), so
 *   all property names are fetched and the candidates are intersected client-side; GraphQL omits properties
 *   absent on the localized node (no fallback), the same presence test as the server's i18n.hasProperty.
 *
 * Language codes come from the site configuration and are inlined as literals, as GraphQL variables cannot
 * hold a dynamic number of values.
 *
 * @param {array} blockedLanguages the language codes with at least one MANDATORY_LANGUAGE_UNPUBLISHABLE pair
 * @returns {object} the query document
 */
export const buildBlockedDetailsQuery = blockedLanguages => gql`
    query publicationBlockedDetails($uuids: [String!]!, $uiLanguage: String!) {
        jcr {
            nodesById(uuids: $uuids) {
                ...NodeCacheRequiredFields
                site {
                    ...NodeCacheRequiredFields
                    defaultLanguage
                    languages {
                        language
                        displayName
                        mandatory
                        activeInEdit
                    }
                }
                primaryNodeType {
                    name
                    properties {
                        name
                        mandatory
                        internationalized
                        displayName(language: $uiLanguage)
                    }
                }
                ${blockedLanguages.map(language => `
                ${getPropertiesAliasForLanguage(language)}: properties(language: "${language}") {
                    name
                }`).join('')}
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
