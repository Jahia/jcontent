import {
    getAliasForLanguage,
    getPublicationDecision,
    groupPairsByNode,
    publicationDecisionTypes,
    toPublicationPairs
} from './getPublicationDecision';

const pair = overrides => ({
    uuid: 'uuid-1',
    path: '/sites/mySite/home',
    displayName: 'Home',
    language: 'en',
    publicationStatus: 'MODIFIED',
    allowedToPublishWithoutWorkflow: true,
    ...overrides
});

describe('getPublicationDecision', () => {
    it('should delegate to GWT when no pair is blocked', () => {
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'MODIFIED'}),
                pair({language: 'fr', publicationStatus: 'NOT_PUBLISHED', allowedToPublishWithoutWorkflow: false})
            ],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.DELEGATE_TO_GWT);
    });

    it('should show the partially blocked dialog when every pair needing publication can bypass the workflow', () => {
        const blockedEn = pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const blockedDe = pair({language: 'de', publicationStatus: 'CONFLICT'});
        const modifiedFr = pair({language: 'fr', publicationStatus: 'MODIFIED'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, modifiedFr, blockedDe],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEn, blockedDe]);
        expect(decision.pairsToPublish).toEqual([modifiedFr]);
    });

    it('should exclude pairs with nothing to publish from the pairs to publish', () => {
        const blockedEs = pair({language: 'es', publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const publishedEn = pair({publicationStatus: 'PUBLISHED'});
        const modifiedFr = pair({language: 'fr', publicationStatus: 'MODIFIED'});
        const decision = getPublicationDecision({
            pairs: [publishedEn, modifiedFr, blockedEs],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEs]);
        expect(decision.pairsToPublish).toEqual([modifiedFr]);
    });

    it('should delegate to GWT when a pair needing publication requires a workflow (conservative hybrid fallback)', () => {
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'}),
                pair({language: 'fr', publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: false})
            ],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.DELEGATE_TO_GWT);
    });

    it('should ignore the workflow flag of pairs with nothing to publish', () => {
        const blockedEs = pair({language: 'es', publicationStatus: 'CONFLICT'});
        const publishedEn = pair({publicationStatus: 'PUBLISHED', allowedToPublishWithoutWorkflow: false});
        const modifiedFr = pair({language: 'fr', publicationStatus: 'MODIFIED'});
        const decision = getPublicationDecision({
            pairs: [publishedEn, modifiedFr, blockedEs],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.pairsToPublish).toEqual([modifiedFr]);
    });

    it('should show the all blocked dialog when every pair is blocked', () => {
        const blockedEn = pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const blockedFr = pair({language: 'fr', publicationStatus: 'CONFLICT'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, blockedFr],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_ALL_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEn, blockedFr]);
        expect(decision.pairsToPublish).toEqual([]);
    });

    it('should show the all blocked dialog when the non-blocked pairs are already published', () => {
        // Real case: /sites/luxe/home/buy with en=PUBLISHED, fr=PUBLISHED, es=blocked. GWT shows the
        // OK-only info box because nothing remains to publish once the blocked rows are removed.
        const blockedEs = pair({language: 'es', publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'PUBLISHED'}),
                pair({language: 'fr', publicationStatus: 'PUBLISHED'}),
                blockedEs
            ],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_ALL_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEs]);
        expect(decision.pairsToPublish).toEqual([]);
    });

    it('should not treat MANDATORY_LANGUAGE_VALID as blocked and delegate to GWT when only such pairs exist', () => {
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'MANDATORY_LANGUAGE_VALID', allowedToPublishWithoutWorkflow: false}),
                pair({language: 'fr', publicationStatus: 'MANDATORY_LANGUAGE_VALID'})
            ],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.DELEGATE_TO_GWT);
    });

    it('should treat MANDATORY_LANGUAGE_VALID pairs as having nothing to publish when blocked pairs exist', () => {
        const blockedEn = pair({publicationStatus: 'CONFLICT'});
        const validFr = pair({language: 'fr', publicationStatus: 'MANDATORY_LANGUAGE_VALID'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, validFr],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_ALL_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEn]);
        expect(decision.pairsToPublish).toEqual([]);
        expect(decision.heldBackPairs).toEqual([validFr]);
    });

    it('should expose the MANDATORY_LANGUAGE_VALID pairs as held back on the partially blocked dialog too', () => {
        const blockedEn = pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const validEs = pair({language: 'es', publicationStatus: 'MANDATORY_LANGUAGE_VALID'});
        const modifiedFr = pair({language: 'fr', publicationStatus: 'MODIFIED'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, validEs, modifiedFr],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.heldBackPairs).toEqual([validEs]);
        expect(decision.pairsToPublish).toEqual([modifiedFr]);
    });

    it('should treat MARKED_FOR_DELETION pairs as needing publication', () => {
        const blockedEn = pair({publicationStatus: 'CONFLICT'});
        const deletionFr = pair({language: 'fr', publicationStatus: 'MARKED_FOR_DELETION'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, deletionFr],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.pairsToPublish).toEqual([deletionFr]);
    });

    it('should delegate to GWT for unpublication, even with blocked pairs', () => {
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'}),
                pair({language: 'fr', publicationStatus: 'CONFLICT'})
            ],
            checkForUnpublication: true
        });

        expect(decision.type).toBe(publicationDecisionTypes.DELEGATE_TO_GWT);
    });
});

describe('toPublicationPairs', () => {
    it('should build one pair per node per language from aliased publication infos', () => {
        const nodes = [{
            uuid: 'uuid-1',
            path: '/sites/mySite/home',
            displayName: 'Home',
            [getAliasForLanguage('en')]: {publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: true},
            [getAliasForLanguage('fr')]: {publicationStatus: 'CONFLICT', allowedToPublishWithoutWorkflow: false}
        }];

        expect(toPublicationPairs(nodes, ['en', 'fr'])).toEqual([
            {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'en', publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: true},
            {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'fr', publicationStatus: 'CONFLICT', allowedToPublishWithoutWorkflow: false}
        ]);
    });

    it('should build safe aliases for language codes with special characters', () => {
        expect(getAliasForLanguage('en')).toBe('pub_en');
        expect(getAliasForLanguage('pt-BR')).toBe('pub_pt_BR');
        expect(getAliasForLanguage('fr_FR')).toBe('pub_fr_FR');
    });
});

describe('groupPairsByNode', () => {
    it('should group the languages of each node', () => {
        const grouped = groupPairsByNode([
            pair({uuid: 'uuid-1', language: 'en'}),
            pair({uuid: 'uuid-2', language: 'en'}),
            pair({uuid: 'uuid-1', language: 'fr'})
        ]);

        expect(grouped).toEqual([
            {uuid: 'uuid-1', languages: ['en', 'fr']},
            {uuid: 'uuid-2', languages: ['en']}
        ]);
    });
});
