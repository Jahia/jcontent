import {useCallback, useContext} from 'react';
import {useApolloClient} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PublicationBlockedDialog from './PublicationBlockedDialog';
import JContentConstants from '~/JContent/JContent.constants';
import {buildBlockedDetailsQuery, buildPreflightQuery} from './publication.gql-queries';
import {getPublicationDecision, publicationDecisionTypes, toPublicationPairs} from './getPublicationDecision';
import {toMissingPropertiesByPair} from './getMissingMandatoryProperties';

const {MANDATORY_LANGUAGE_UNPUBLISHABLE} = JContentConstants.availablePublicationStatuses;

/**
 * Shared wrapper around the GWT publication bridge (window.authoringApi.openPublicationWorkflow).
 *
 * Before delegating to GWT, it runs a pre-flight GraphQL query checking, per selected node and target
 * language, whether the publication is blocked (MANDATORY_LANGUAGE_UNPUBLISHABLE or CONFLICT status). When
 * the legacy GWT confirmation would fire and every pair actually needing publication can be published
 * without workflow, a Moonstone dialog replaces it (see PublicationBlockedDialog); in every other case the
 * request is delegated to the GWT bridge unchanged.
 *
 * When the dialog must be shown, a second query (blocked path only, keeping the happy path at one
 * round-trip) fetches the display details: the site languages, and per blocked node the mandatory
 * internationalized property definitions plus the localized properties present in each blocked language,
 * from which the missing properties are derived (see getMissingMandatoryProperties). A failure of that
 * details query degrades gracefully to the dialog without property details.
 *
 * @returns {Function} an async function accepting {uuids, allSubTree, allLanguages, checkForUnpublication,
 *                     siteLanguages}, where siteLanguages is the list of site language objects (used to
 *                     resolve the target languages when allLanguages is true)
 */
export const useOpenPublicationWorkflow = () => {
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();
    const {currentLanguage, uiLanguage} = useSelector(state => ({currentLanguage: state.language, uiLanguage: state.uilang}), shallowEqual);

    return useCallback(async ({uuids, allSubTree = false, allLanguages = false, checkForUnpublication = false, siteLanguages}) => {
        const delegateToGwt = () => window.authoringApi.openPublicationWorkflow(uuids, allSubTree, allLanguages, checkForUnpublication);

        // Unpublication never triggers the legacy blocked-items dialog: skip the pre-flight entirely
        if (checkForUnpublication) {
            delegateToGwt();
            return;
        }

        const targetLanguages = allLanguages ?
            (siteLanguages || []).filter(language => language.activeInEdit).map(language => language.language) :
            [currentLanguage];

        if (targetLanguages.length === 0) {
            delegateToGwt();
            return;
        }

        let decision;
        try {
            const {data} = await client.query({
                query: buildPreflightQuery(targetLanguages),
                variables: {uuids, displayLanguage: currentLanguage, subNodes: allSubTree},
                fetchPolicy: 'network-only'
            });
            decision = getPublicationDecision({
                pairs: toPublicationPairs(data.jcr.nodesById, targetLanguages),
                checkForUnpublication
            });
        } catch (error) {
            console.error('Publication pre-flight check failed, falling back to the legacy publication flow', error);
            delegateToGwt();
            return;
        }

        if (decision.type === publicationDecisionTypes.DELEGATE_TO_GWT) {
            delegateToGwt();
            return;
        }

        // Blocked path only: fetch the display details (missing properties, site languages) in a second query
        let missingPropertiesByPair = null;
        let blockedSiteLanguages = siteLanguages || null;
        try {
            const blockedNodeUuids = [...new Set(decision.blockedPairs.map(pair => pair.uuid))];
            const blockedLanguages = [...new Set(decision.blockedPairs
                .filter(pair => pair.publicationStatus === MANDATORY_LANGUAGE_UNPUBLISHABLE)
                .map(pair => pair.language))];
            const {data: detailsData} = await client.query({
                query: buildBlockedDetailsQuery(blockedLanguages),
                variables: {uuids: blockedNodeUuids, uiLanguage: uiLanguage || currentLanguage},
                fetchPolicy: 'network-only'
            });
            const detailNodes = detailsData.jcr.nodesById;
            missingPropertiesByPair = toMissingPropertiesByPair(detailNodes, decision.blockedPairs);
            blockedSiteLanguages = detailNodes[0]?.site?.languages || blockedSiteLanguages;
        } catch (error) {
            console.error('Publication blocked-details query failed, showing the dialog without property details', error);
        }

        componentRenderer.render('publicationBlockedDialog', PublicationBlockedDialog, {
            blockedPairs: decision.blockedPairs,
            heldBackPairs: decision.heldBackPairs,
            pairsToPublish: decision.pairsToPublish,
            missingPropertiesByPair,
            siteLanguages: blockedSiteLanguages,
            isAllSubTree: allSubTree,
            onExit: () => componentRenderer.destroy('publicationBlockedDialog')
        });
    }, [client, componentRenderer, currentLanguage, uiLanguage]);
};
