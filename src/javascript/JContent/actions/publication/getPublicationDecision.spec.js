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

    it('should show the partially blocked dialog when every surviving pair can bypass the workflow', () => {
        const blockedEn = pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'});
        const blockedDe = pair({language: 'de', publicationStatus: 'CONFLICT'});
        const survivingFr = pair({language: 'fr', publicationStatus: 'MODIFIED'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, survivingFr, blockedDe],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEn, blockedDe]);
        expect(decision.survivingPairs).toEqual([survivingFr]);
    });

    it('should delegate to GWT when a surviving pair requires a workflow (conservative hybrid fallback)', () => {
        const decision = getPublicationDecision({
            pairs: [
                pair({publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE'}),
                pair({language: 'fr', publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: false})
            ],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.DELEGATE_TO_GWT);
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
        expect(decision.survivingPairs).toEqual([]);
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

    it('should treat MANDATORY_LANGUAGE_VALID pairs as surviving pairs when blocked pairs exist', () => {
        const blockedEn = pair({publicationStatus: 'CONFLICT'});
        const survivingFr = pair({language: 'fr', publicationStatus: 'MANDATORY_LANGUAGE_VALID'});
        const decision = getPublicationDecision({
            pairs: [blockedEn, survivingFr],
            checkForUnpublication: false
        });

        expect(decision.type).toBe(publicationDecisionTypes.SHOW_PARTIALLY_BLOCKED_DIALOG);
        expect(decision.blockedPairs).toEqual([blockedEn]);
        expect(decision.survivingPairs).toEqual([survivingFr]);
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
