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

/**
 * The blocked-details query, executed only when the pre-flight found blocked pairs (the happy path stays at
 * a single round-trip). Per blocked node it fetches:
 * - the site languages (displayName, mandatory flag) used to render the language sections,
 * - the missing mandatory internationalized properties per blocked language, computed server-side by this
 *   module's own GraphQL extension (JCRNodePublicationExtensions.missingMandatoryI18nProperties), an exact
 *   mirror of the core check JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale; the blocked
 *   verdict itself stays server-authoritative via aggregatedPublicationInfo. The module extension is used
 *   instead of graphql-core's primaryNodeType.properties because the latter returns the non-overridden
 *   inherited definitions (e.g. jcr:title on jnt:page reported as non-mandatory), unlike the resolved
 *   definition map the server check uses.
 */
export const BlockedDetailsQuery = gql`
    query publicationBlockedDetails($uuids: [String!]!, $languages: [String!]!, $uiLocale: String!) {
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
                missingMandatoryI18nProperties(languages: $languages, uiLocale: $uiLocale) {
                    language
                    properties {
                        name
                        label
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
