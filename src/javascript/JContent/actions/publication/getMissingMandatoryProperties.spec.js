import {
    computeMissingProperties,
    getCandidateProperties,
    getPairKey,
    getPropertiesAliasForLanguage,
    toMissingPropertiesByPair
} from './getMissingMandatoryProperties';

const definition = overrides => ({
    name: 'jcr:title',
    mandatory: true,
    internationalized: true,
    displayName: 'Title',
    ...overrides
});

const blockedPair = overrides => ({
    uuid: 'uuid-1',
    path: '/sites/mySite/home',
    displayName: 'Home',
    language: 'en',
    publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE',
    allowedToPublishWithoutWorkflow: true,
    ...overrides
});

describe('getPropertiesAliasForLanguage', () => {
    it('should build safe aliases for language codes with special characters', () => {
        expect(getPropertiesAliasForLanguage('en')).toBe('props_en');
        expect(getPropertiesAliasForLanguage('pt-BR')).toBe('props_pt_BR');
    });
});

describe('getCandidateProperties', () => {
    it('should keep only the mandatory internationalized definitions, mirroring the server check', () => {
        const primaryNodeType = {
            name: 'jnt:article',
            properties: [
                definition(),
                definition({name: 'body', displayName: 'Body'}),
                definition({name: 'alignment', displayName: 'Alignment', internationalized: false}),
                definition({name: 'teaser', displayName: 'Teaser', mandatory: false})
            ]
        };

        expect(getCandidateProperties(primaryNodeType)).toEqual([
            {name: 'jcr:title', displayName: 'Title'},
            {name: 'body', displayName: 'Body'}
        ]);
    });

    it('should fall back to the JCR name when the definition has no display name', () => {
        const primaryNodeType = {properties: [definition({displayName: null})]};

        expect(getCandidateProperties(primaryNodeType)).toEqual([{name: 'jcr:title', displayName: 'jcr:title'}]);
    });

    it('should return no candidate when the node type is unavailable', () => {
        expect(getCandidateProperties(null)).toEqual([]);
        expect(getCandidateProperties({name: 'jnt:page'})).toEqual([]);
    });
});

describe('computeMissingProperties', () => {
    const candidates = [
        {name: 'jcr:title', displayName: 'Title'},
        {name: 'body', displayName: 'Body'}
    ];

    it('should report the candidates absent from the localized node', () => {
        expect(computeMissingProperties(candidates, ['jcr:title'])).toEqual([{name: 'body', displayName: 'Body'}]);
    });

    it('should count a property present with an empty value as present (GraphQL returns its name, like the server hasProperty test)', () => {
        // GraphQL returns the property row even when its value is an empty string: only truly absent
        // properties are omitted, matching the server's i18n.hasProperty semantics
        expect(computeMissingProperties(candidates, ['jcr:title', 'body'])).toEqual([]);
    });

    it('should report every candidate when the localized node has none of them', () => {
        expect(computeMissingProperties(candidates, ['jcr:created', 'jcr:uuid'])).toEqual(candidates);
    });
});

describe('toMissingPropertiesByPair', () => {
    // The properties list of primaryNodeType already contains the definitions inherited from supertypes
    // (same universe as the server's getPropertyDefinitionsAsMap): jcr:title below stands for a definition
    // inherited from mix:title while body is declared by jnt:article itself
    const articleNodeType = {
        name: 'jnt:article',
        properties: [
            definition({name: 'jcr:title', displayName: 'Title'}),
            definition({name: 'body', displayName: 'Body'}),
            definition({name: 'alignment', displayName: 'Alignment', internationalized: false})
        ]
    };

    it('should compute the missing set per blocked (node, language) pair, in one or several languages', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            primaryNodeType: articleNodeType,
            [getPropertiesAliasForLanguage('en')]: [{name: 'jcr:title'}, {name: 'alignment'}],
            [getPropertiesAliasForLanguage('fr')]: [{name: 'alignment'}]
        }];
        const pairs = [
            blockedPair({language: 'en'}),
            blockedPair({language: 'fr'})
        ];

        expect(toMissingPropertiesByPair(detailNodes, pairs)).toEqual({
            [getPairKey('uuid-1', 'en')]: [{name: 'body', displayName: 'Body'}],
            [getPairKey('uuid-1', 'fr')]: [
                {name: 'jcr:title', displayName: 'Title'},
                {name: 'body', displayName: 'Body'}
            ]
        });
    });

    it('should include the mandatory properties inherited from supertypes in the missing set', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            primaryNodeType: articleNodeType,
            [getPropertiesAliasForLanguage('en')]: [{name: 'body'}]
        }];

        expect(toMissingPropertiesByPair(detailNodes, [blockedPair()])).toEqual({
            [getPairKey('uuid-1', 'en')]: [{name: 'jcr:title', displayName: 'Title'}]
        });
    });

    it('should treat a property present with an empty value as present', () => {
        // GraphQL returns {name: 'body'} even when the stored value is '', exactly like the server check
        const detailNodes = [{
            uuid: 'uuid-1',
            primaryNodeType: articleNodeType,
            [getPropertiesAliasForLanguage('en')]: [{name: 'jcr:title'}, {name: 'body'}]
        }];

        expect(toMissingPropertiesByPair(detailNodes, [blockedPair()])).toEqual({
            [getPairKey('uuid-1', 'en')]: []
        });
    });

    it('should produce an empty missing set when the blocking comes from a descendant', () => {
        // The selected root passes the property check but its aggregated status is blocked because of a
        // sub-item (subNodes: true): the dialog then shows the generic sub-items note
        const detailNodes = [{
            uuid: 'uuid-1',
            primaryNodeType: articleNodeType,
            [getPropertiesAliasForLanguage('en')]: [{name: 'jcr:title'}, {name: 'body'}, {name: 'alignment'}]
        }];

        expect(toMissingPropertiesByPair(detailNodes, [blockedPair()])).toEqual({
            [getPairKey('uuid-1', 'en')]: []
        });
    });

    it('should skip pairs blocked by a conflict: no property detail applies to them', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            primaryNodeType: articleNodeType,
            [getPropertiesAliasForLanguage('en')]: []
        }];
        const pairs = [blockedPair({publicationStatus: 'CONFLICT'})];

        expect(toMissingPropertiesByPair(detailNodes, pairs)).toEqual({});
    });

    it('should skip pairs whose node is absent from the detail nodes', () => {
        expect(toMissingPropertiesByPair([], [blockedPair()])).toEqual({});
    });
});
