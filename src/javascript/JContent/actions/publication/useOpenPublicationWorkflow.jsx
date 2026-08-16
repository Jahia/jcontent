import {useCallback, useContext} from 'react';
import {useApolloClient} from '@apollo/client';
import {useSelector} from 'react-redux';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PublicationBlockedDialog from './PublicationBlockedDialog';
import {buildPreflightQuery} from './publication.gql-queries';
import {getPublicationDecision, publicationDecisionTypes, toPublicationPairs} from './getPublicationDecision';

/**
 * Shared wrapper around the GWT publication bridge (window.authoringApi.openPublicationWorkflow).
 *
 * Before delegating to GWT, it runs a pre-flight GraphQL query checking, per selected node and target
 * language, whether the publication is blocked (MANDATORY_LANGUAGE_UNPUBLISHABLE or CONFLICT status). When
 * the legacy GWT confirmation would fire and every non-blocked pair can be published without workflow, a
 * Moonstone dialog replaces it (see PublicationBlockedDialog); in every other case the request is delegated
 * to the GWT bridge unchanged.
 *
 * @returns {Function} an async function accepting {uuids, allSubTree, allLanguages, checkForUnpublication,
 *                     siteLanguages}, where siteLanguages is the list of site language objects (used to
 *                     resolve the target languages when allLanguages is true)
 */
export const useOpenPublicationWorkflow = () => {
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();
    const currentLanguage = useSelector(state => state.language);

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

        componentRenderer.render('publicationBlockedDialog', PublicationBlockedDialog, {
            blockedPairs: decision.blockedPairs,
            survivingPairs: decision.survivingPairs,
            isAllSubTree: allSubTree,
            onExit: () => componentRenderer.destroy('publicationBlockedDialog')
        });
    }, [client, componentRenderer, currentLanguage]);
};
