import JContentConstants from '~/JContent/JContent.constants';

const {MANDATORY_LANGUAGE_UNPUBLISHABLE} = JContentConstants.availablePublicationStatuses;

/**
 * Builds the key identifying a (node, language) pair in the missing-properties map
 *
 * @param {string} uuid the node uuid
 * @param {string} language the language code
 * @returns {string} the pair key
 */
export const getPairKey = (uuid, language) => `${uuid}|${language}`;

/**
 * Maps the server-computed missing mandatory properties to the blocked (node, language) pairs in
 * MANDATORY_LANGUAGE_UNPUBLISHABLE status. Pairs blocked for another reason (CONFLICT) are skipped: no
 * property detail applies to them.
 *
 * The computation itself lives server-side in THIS module (JCRNodePublicationExtensions
 * .missingMandatoryI18nProperties, src/main/java), an exact mirror of the core check
 * JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale (primary node type resolved definition map,
 * incl. overridden inherited definitions, never mixins; a property present with an empty value counts as
 * present). The blocked verdict always stays server-authoritative via aggregatedPublicationInfo.
 *
 * An EMPTY missing set for a blocked pair means the selected node itself passes the property check: the
 * blocking then originates from a descendant or reference folded into the aggregated status (subNodes), and
 * the dialog shows a generic "sub-items are incomplete" note instead of a property list.
 *
 * @param {array} detailNodes the nodes returned by the blocked-details query, each carrying
 *                            missingMandatoryI18nProperties entries per blocked language
 * @param {array} blockedPairs the blocked (node, language) pairs from the publication decision
 * @returns {object} a map of pair key (see getPairKey) to the missing properties ({name, displayName})
 */
export const toMissingPropertiesByPair = (detailNodes, blockedPairs) => {
    const nodesByUuid = detailNodes.reduce((acc, node) => {
        acc[node.uuid] = node;
        return acc;
    }, {});

    return blockedPairs
        .filter(pair => pair.publicationStatus === MANDATORY_LANGUAGE_UNPUBLISHABLE)
        .reduce((acc, pair) => {
            const languageEntry = (nodesByUuid[pair.uuid]?.missingMandatoryI18nProperties || [])
                .find(entry => entry.language === pair.language);
            if (languageEntry) {
                acc[getPairKey(pair.uuid, pair.language)] = (languageEntry.properties || []).map(property => ({
                    name: property.name,
                    displayName: property.label || property.name
                }));
            }

            return acc;
        }, {});
};
