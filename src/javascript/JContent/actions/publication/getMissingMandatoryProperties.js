import JContentConstants from '~/JContent/JContent.constants';

const {MANDATORY_LANGUAGE_UNPUBLISHABLE} = JContentConstants.availablePublicationStatuses;

/**
 * Builds the GraphQL alias used for the localized properties of a given language
 *
 * @param {string} language the language code
 * @returns {string} a safe GraphQL alias for the language
 */
export const getPropertiesAliasForLanguage = language => `props_${language.replace(/[^a-zA-Z0-9_]/g, '_')}`;

/**
 * Extracts the mandatory internationalized property definitions of a node's primary node type: the candidate
 * properties whose absence in a language makes that language unpublishable.
 *
 * DISPLAY-ONLY MIRROR OF A SERVER CHECK: this reconstructs, client-side, the candidate list used by
 * JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale (jahia core), which iterates
 * getPrimaryNodeType().getPropertyDefinitionsAsMap() and requires every definition that is
 * isInternationalized() && isMandatory() to exist on the j:translation_<locale> node. Two consequences:
 * - PRIMARY NODE TYPE ONLY (the GraphQL primaryNodeType.properties list already includes the definitions
 *   inherited from supertypes, the same universe as the server map), never mixins, exactly like the server.
 * - If core ever changes that check, this list could drift and mislabel the detail, but never the verdict:
 *   whether a (node, language) pair is blocked always comes from the server-computed
 *   aggregatedPublicationInfo.publicationStatus, which stays authoritative.
 *
 * @param {object} primaryNodeType the node's primaryNodeType with its property definitions
 * @returns {array} the candidate properties, each with its JCR name and localized displayName
 */
export const getCandidateProperties = primaryNodeType => (primaryNodeType?.properties || [])
    .filter(definition => definition.mandatory && definition.internationalized)
    .map(definition => ({name: definition.name, displayName: definition.displayName || definition.name}));

/**
 * Computes the candidate properties missing from a localized node, given the property names GraphQL returned
 * for that language. GraphQL omits properties absent on the localized node (no language fallback by default),
 * which is equivalent to the server's i18n.hasProperty test: a property present with an empty-string value is
 * returned by GraphQL, and counts as present on the server too.
 *
 * @param {array} candidates the candidate properties ({name, displayName}) of the node's primary node type
 * @param {array} presentNames the property names present on the localized node
 * @returns {array} the missing candidate properties
 */
export const computeMissingProperties = (candidates, presentNames) => candidates.filter(candidate => !presentNames.includes(candidate.name));

/**
 * Builds the key identifying a (node, language) pair in the missing-properties map
 *
 * @param {string} uuid the node uuid
 * @param {string} language the language code
 * @returns {string} the pair key
 */
export const getPairKey = (uuid, language) => `${uuid}|${language}`;

/**
 * Computes, for every blocked (node, language) pair in MANDATORY_LANGUAGE_UNPUBLISHABLE status, the mandatory
 * internationalized properties missing on the node in that language. Pairs blocked for another reason
 * (CONFLICT) are skipped: no property detail applies to them.
 *
 * An EMPTY missing set for a blocked pair means the selected node itself passes the property check: the
 * blocking then originates from a descendant or reference folded into the aggregated status (subNodes), and
 * the dialog shows a generic "sub-items are incomplete" note instead of a property list.
 *
 * @param {array} detailNodes the nodes returned by the blocked-details query, each carrying primaryNodeType
 *                            and one aliased localized properties list per blocked language
 * @param {array} blockedPairs the blocked (node, language) pairs from the publication decision
 * @returns {object} a map of pair key (see getPairKey) to the missing candidate properties
 */
export const toMissingPropertiesByPair = (detailNodes, blockedPairs) => {
    const nodesByUuid = detailNodes.reduce((acc, node) => {
        acc[node.uuid] = node;
        return acc;
    }, {});

    return blockedPairs
        .filter(pair => pair.publicationStatus === MANDATORY_LANGUAGE_UNPUBLISHABLE)
        .reduce((acc, pair) => {
            const node = nodesByUuid[pair.uuid];
            if (node) {
                const candidates = getCandidateProperties(node.primaryNodeType);
                const presentNames = (node[getPropertiesAliasForLanguage(pair.language)] || []).map(property => property.name);
                acc[getPairKey(pair.uuid, pair.language)] = computeMissingProperties(candidates, presentNames);
            }

            return acc;
        }, {});
};
