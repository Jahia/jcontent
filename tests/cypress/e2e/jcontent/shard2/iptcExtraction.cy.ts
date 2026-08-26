import {JContent} from '../../../page-object';
import gql from 'graphql-tag';

/**
 * The values carried by cypress/fixtures/assets/iptc-xmp-test.webp, read out of its XMP packet.
 * The file is XMP-only — WebP carries no IIM block — so this exercises the XMP branch of
 * ImageIptcExtractor and the XMP half of IptcPropertyMapping.
 *
 * Two of them are deliberately non-ASCII: encoding is where reading a binary usually breaks, and
 * an em-dash and an umlaut fail differently from a plain accent.
 */
const EXPECTED: Record<string, string> = {
    'j:iptcObjectName': 'webp object name',
    'j:iptcHeadline': 'webp headline',
    'j:iptcCaption': 'webp caption',
    'j:iptcCaptionWriter': 'clement egger',
    'j:iptcByline': 'webp byline',
    'j:iptcBylineTitle': 'webp byline title',
    'j:iptcCredit': 'webp credit',
    'j:iptcSource': 'webp source — émile',
    'j:iptcCopyrightNotice': 'webp copyright notice',
    'j:iptcCity': 'Zürich webp city',
    'j:iptcSublocation': 'france',
    'j:iptcProvinceState': 'webp province state',
    'j:iptcCountry': 'france',
    'j:iptcDateCreated': '2026-08-20',
    'j:iptcCategory': 'WEB',
    'j:iptcSpecialInstructions': 'webp special instructions',
    'j:iptcUrgency': '5',
    'j:iptcTransmissionReference': 'webp transmission ref'
};

const MULTIPLE: Record<string, string[]> = {
    'j:iptcKeywords': ['webp keyword one', 'webp keyword two'],
    'j:iptcSupplementalCategories': ['webp supp cat one', 'webp supp cat two']
};

describe('IPTC/XMP extraction on upload', () => {
    const siteKey = 'iptcExtractionSite';
    const fileName = 'iptc-xmp-test.webp';
    const filePath = `/sites/${siteKey}/files/${fileName}`;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession();

        JContent.visit(siteKey, 'en', 'media/files')
            .getMedia()
            .open()
            .uploadFileViaDialog(fileName, 'assets');

        // The extraction runs in a listener on the uploaded binary, so the mixin appears slightly
        // after the upload call returns. Wait for the mixin rather than for a fixed delay.
        cy.waitUntil(
            () => cy.apollo({
                query: gql`query { jcr { nodeByPath(path: "${filePath}") { mixinTypes { name } } } }`,
                errorPolicy: 'all'
            }).then(({data}) => Boolean(
                data?.jcr?.nodeByPath?.mixinTypes?.some((m: {name: string}) => m.name === 'jmix:iptc')
            )),
            {timeout: 30000, interval: 1000, errorMsg: 'jmix:iptc was never applied to the uploaded image'}
        );
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('applies the jmix:iptc mixin to an image carrying XMP', function () {
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "${filePath}") { mixinTypes { name } } } }`
        }).then(({data}) => {
            const mixins = data.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name);
            expect(mixins).to.include('jmix:iptc');
        });
    });

    it('reads every single-valued field into its own property', function () {
        cy.apollo({
            query: gql`query {
                jcr {
                    nodeByPath(path: "${filePath}") {
                        properties(names: [${Object.keys(EXPECTED).map(n => `"${n}"`).join(',')}]) {
                            name
                            value
                        }
                    }
                }
            }`
        }).then(({data}) => {
            const actual: Record<string, string> = {};
            data.jcr.nodeByPath.properties.forEach((p: {name: string; value: string}) => {
                actual[p.name] = p.value;
            });

            // Asserted as one object rather than field by field: a mapping that swaps two
            // properties shows up as a diff of both, instead of the first assertion failing and
            // hiding the second.
            expect(actual).to.deep.equal(EXPECTED);
        });
    });

    it('keeps every value of a multi-valued field, in order', function () {
        cy.apollo({
            query: gql`query {
                jcr {
                    nodeByPath(path: "${filePath}") {
                        properties(names: [${Object.keys(MULTIPLE).map(n => `"${n}"`).join(',')}]) {
                            name
                            values
                        }
                    }
                }
            }`
        }).then(({data}) => {
            const actual: Record<string, string[]> = {};
            data.jcr.nodeByPath.properties.forEach((p: {name: string; values: string[]}) => {
                actual[p.name] = p.values;
            });

            expect(actual).to.deep.equal(MULTIPLE);
        });
    });

    it('carries accented and non-latin characters through unchanged', function () {
        // Worth its own test: these survive a naive read but come back mangled when the binary is
        // decoded with the platform charset instead of what the XMP packet declares.
        cy.apollo({
            query: gql`query {
                jcr {
                    nodeByPath(path: "${filePath}") {
                        properties(names: ["j:iptcSource", "j:iptcCity"]) { name value }
                    }
                }
            }`
        }).then(({data}) => {
            const byName: Record<string, string> = {};
            data.jcr.nodeByPath.properties.forEach((p: {name: string; value: string}) => {
                byName[p.name] = p.value;
            });

            expect(byName['j:iptcSource']).to.equal('webp source — émile');
            expect(byName['j:iptcCity']).to.equal('Zürich webp city');
        });
    });
});
