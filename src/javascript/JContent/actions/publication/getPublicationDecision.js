import JContentConstants from '~/JContent/JContent.constants';

const {MANDATORY_LANGUAGE_UNPUBLISHABLE, CONFLICT} = JContentConstants.availablePublicationStatuses;

/**
 * Publication statuses that make a (node, language) pair blocked, i.e. that would trigger the legacy GWT
 * "missing mandatory property / conflict" confirmation dialog. Note that MANDATORY_LANGUAGE_VALID is NOT
 * blocked: GWT does not show the dialog for it.
 */
export const blockedPublicationStatuses = [MANDATORY_LANGUAGE_UNPUBLISHABLE, CONFLICT];

export const publicationDecisionTypes = {
    DELEGATE_TO_GWT: 'DELEGATE_TO_GWT',
    SHOW_PARTIALLY_BLOCKED_DIALOG: 'SHOW_PARTIALLY_BLOCKED_DIALOG',
    SHOW_ALL_BLOCKED_DIALOG: 'SHOW_ALL_BLOCKED_DIALOG'
};

/**
 * Builds the GraphQL alias used for the aggregated publication info of a given language
 *
 * @param {string} language the language code
 * @returns {string} a safe GraphQL alias for the language
 */
export const getAliasForLanguage = language => `pub_${language.replace(/[^a-zA-Z0-9_]/g, '_')}`;

/**
 * Flattens the pre-flight query result into (node, language) pairs
 *
 * @param {array} nodes the nodes returned by the pre-flight query, each carrying one aliased
 *                      aggregatedPublicationInfo per target language
 * @param {array} languages the target language codes
 * @returns {array} one entry per (node, language) pair
 */
export const toPublicationPairs = (nodes, languages) => nodes.flatMap(node => languages.map(language => {
    const publicationInfo = node[getAliasForLanguage(language)];
    return {
        uuid: node.uuid,
        path: node.path,
        displayName: node.displayName,
        language,
        publicationStatus: publicationInfo?.publicationStatus,
        allowedToPublishWithoutWorkflow: publicationInfo?.allowedToPublishWithoutWorkflow
    };
}));

/**
 * Groups (node, language) pairs by node, to build one publish mutation per node
 *
 * @param {array} pairs (node, language) pairs
 * @returns {array} one entry per node, with the languages to publish it in
 */
export const groupPairsByNode = pairs => Object.values(pairs.reduce((acc, pair) => {
    if (acc[pair.uuid]) {
        acc[pair.uuid].languages.push(pair.language);
    } else {
        acc[pair.uuid] = {uuid: pair.uuid, languages: [pair.language]};
    }

    return acc;
}, {}));

/**
 * Decides how a publication request must be handled, based on the pre-flight publication info.
 *
 * Decision table:
 * - checkForUnpublication            -> DELEGATE_TO_GWT (unpublication never triggers the legacy dialog)
 * - no blocked pair                  -> DELEGATE_TO_GWT (the legacy confirm cannot fire; happy path unchanged)
 * - blocked pairs, no surviving pair -> SHOW_ALL_BLOCKED_DIALOG (informational variant)
 * - blocked pairs, and at least one surviving pair cannot bypass the workflow
 *                                    -> DELEGATE_TO_GWT (conservative hybrid fallback: the legacy dialog and the
 *                                       workflow dashboard keep handling this residual case)
 * - blocked pairs, and every surviving pair can bypass the workflow
 *                                    -> SHOW_PARTIALLY_BLOCKED_DIALOG (Continue publishes only the surviving pairs)
 *
 * @param {object} params
 * @param {array} params.pairs (node, language) pairs, each carrying publicationStatus and allowedToPublishWithoutWorkflow
 * @param {boolean} params.checkForUnpublication whether the request is an unpublication
 * @returns {object} the decision, with the blocked/surviving pairs when a dialog must be shown
 */
export const getPublicationDecision = ({pairs, checkForUnpublication}) => {
    if (checkForUnpublication) {
        return {type: publicationDecisionTypes.DELEGATE_TO_GWT};
    }

    const blockedPairs = pairs.filter(pair => blockedPublicationStatuses.includes(pair.publicationStatus));

    if (blockedPairs.length === 0) {
        return {type: publicationDecisionTypes.DELEGATE_TO_GWT};
    }

    const survivingPairs = pairs.filter(pair => !blockedPublicationStatuses.includes(pair.publicationStatus));

    if (survivingPairs.length === 0) {
        return {type: publicationDecisionTypes.SHOW_ALL_BLOCKED_DIALOG, blockedPairs, survivingPairs};
    }

    if (survivingPairs.some(pair => pair.allowedToPublishWithoutWorkflow !== true)) {
        return {type: publicationDecisionTypes.DELEGATE_TO_GWT};
    }

    return {type: publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG, blockedPairs, survivingPairs};
};
