import {getPairKey, toMissingPropertiesByPair} from './getMissingMandatoryProperties';

const blockedPair = overrides => ({
    uuid: 'uuid-1',
    path: '/sites/mySite/home',
    displayName: 'Home',
    language: 'en',
    publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE',
    allowedToPublishWithoutWorkflow: true,
    ...overrides
});

// The missing sets themselves are computed server-side by the module's GraphQL extension
// (JCRNodePublicationExtensions.missingMandatoryI18nProperties), the exact mirror of the core check
// JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale: primary node type RESOLVED definition map
// (an overriding redeclaration like jcr:title mandatory on jnt:page wins over the inherited mix:title one,
// and inherited supertype definitions are included), never mixins, and a property present with an empty
// value counts as present. These tests cover the client-side mapping of that server result.
describe('toMissingPropertiesByPair', () => {
    it('should key the server-computed missing properties by (node, language) pair, in one or several languages', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            missingMandatoryI18nProperties: [
                {language: 'en', properties: [{name: 'body', label: 'Body'}]},
                {language: 'fr', properties: [{name: 'jcr:title', label: 'Titre'}, {name: 'body', label: 'Corps'}]}
            ]
        }];
        const pairs = [
            blockedPair({language: 'en'}),
            blockedPair({language: 'fr'})
        ];

        expect(toMissingPropertiesByPair(detailNodes, pairs)).toEqual({
            [getPairKey('uuid-1', 'en')]: [{name: 'body', displayName: 'Body'}],
            [getPairKey('uuid-1', 'fr')]: [
                {name: 'jcr:title', displayName: 'Titre'},
                {name: 'body', displayName: 'Corps'}
            ]
        });
    });

    it('should fall back to the JCR name when the server returns no label', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            missingMandatoryI18nProperties: [
                {language: 'en', properties: [{name: 'body', label: null}]}
            ]
        }];

        expect(toMissingPropertiesByPair(detailNodes, [blockedPair()])).toEqual({
            [getPairKey('uuid-1', 'en')]: [{name: 'body', displayName: 'body'}]
        });
    });

    it('should keep an empty missing set when the blocking comes from a descendant', () => {
        // The selected root passes the server property check but its aggregated status is blocked because
        // of a sub-item (subNodes: true): the dialog then shows the generic sub-items note
        const detailNodes = [{
            uuid: 'uuid-1',
            missingMandatoryI18nProperties: [
                {language: 'en', properties: []}
            ]
        }];

        expect(toMissingPropertiesByPair(detailNodes, [blockedPair()])).toEqual({
            [getPairKey('uuid-1', 'en')]: []
        });
    });

    it('should skip pairs blocked by a conflict: no property detail applies to them', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            missingMandatoryI18nProperties: [
                {language: 'en', properties: [{name: 'body', label: 'Body'}]}
            ]
        }];
        const pairs = [blockedPair({publicationStatus: 'CONFLICT'})];

        expect(toMissingPropertiesByPair(detailNodes, pairs)).toEqual({});
    });

    it('should skip pairs whose node or language is absent from the server result', () => {
        const detailNodes = [{
            uuid: 'uuid-1',
            missingMandatoryI18nProperties: [
                {language: 'fr', properties: []}
            ]
        }];

        // Node uuid-2 absent, and uuid-1 has no entry for en: neither pair gets an entry (the dialog shows
        // neither chips nor the sub-items note for them)
        expect(toMissingPropertiesByPair(detailNodes, [
            blockedPair({language: 'en'}),
            blockedPair({uuid: 'uuid-2', language: 'fr'})
        ])).toEqual({});
    });
});
