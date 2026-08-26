import {JContent} from '../../../page-object';
import gql from 'graphql-tag';

/**
 * The two provenances a file can carry its metadata in, and what happens when both are present.
 *
 * iptcExtraction.cy.ts covers WebP, which only ever carries XMP. These two cover the paths it
 * cannot reach: a JPEG carrying an IIM block alongside XMP, and a PNG carrying nothing but a
 * zTXt "Raw profile type iptc" chunk.
 */

const propertiesOf = (path: string, names: string[]) => cy.apollo({
    query: gql`query {
        jcr {
            nodeByPath(path: "${path}") {
                properties(names: [${names.map(n => `"${n}"`).join(',')}]) { name value }
            }
        }
    }`
}).then(({data}) => {
    const actual: Record<string, string> = {};
    data.jcr.nodeByPath.properties.forEach((p: {name: string; value: string}) => {
        actual[p.name] = p.value;
    });
    return actual;
});

const waitForMixin = (path: string) => cy.waitUntil(
    () => cy.apollo({
        query: gql`query { jcr { nodeByPath(path: "${path}") { mixinTypes { name } } } }`,
        errorPolicy: 'all'
    }).then(({data}) => Boolean(
        data?.jcr?.nodeByPath?.mixinTypes?.some((m: {name: string}) => m.name === 'jmix:iptc')
    )),
    {timeout: 30000, interval: 1000, errorMsg: 'jmix:iptc was never applied to the uploaded image'}
);

/**
 * The upload button belongs to the media accordion, which is still settling right after a visit -
 * and more so when a previous spec has just deleted a site. Waiting for it explicitly turns an
 * intermittent "never found button[data-sel-role=fileUpload]" into a wait that either succeeds or
 * says what it was waiting for.
 */
const mediaReadyToUpload = () => {
    cy.get('.moonstone-loader', {timeout: 30000}).should('not.exist');
    cy.get('button[data-sel-role="fileUpload"]', {timeout: 30000}).should('be.visible');
};

describe('IPTC/XMP provenance', () => {
    const siteKey = 'iptcProvenanceSite';
    const jpeg = 'iptc-xmp-precedence.jpg';
    const png = 'iptc-raw-profile.png';
    const pathTo = (name: string) => `/sites/${siteKey}/files/${name}`;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession();

        const media = JContent.visit(siteKey, 'en', 'media/files').getMedia().open();
        mediaReadyToUpload();
        media.uploadFileViaDialog(jpeg, 'assets');
        media.uploadFileViaDialog(png, 'assets');

        waitForMixin(pathTo(jpeg));
        waitForMixin(pathTo(png));
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    describe('a JPEG carrying both IIM and XMP', () => {
        // The IPTC reference file, edited so the two provenances disagree on creator and copyright.
        // ImageIptcExtractor documents that XMP wins; these are the fields that prove it, because
        // reading IIM instead would produce a visibly different value rather than an empty one.
        it('takes the XMP value where the two disagree', function () {
            propertiesOf(pathTo(jpeg), ['j:iptcByline', 'j:iptcCopyrightNotice']).then(actual => {
                expect(actual['j:iptcByline'], 'creator').to.equal('copyright en XMP');
                expect(actual['j:iptcCopyrightNotice'], 'copyright').to.equal('copyright en XMP');

                // Guard against the assertion passing for the wrong reason: these are what the IIM
                // block holds, and neither may survive.
                expect(actual['j:iptcByline']).to.not.contain('Creator1');
                expect(actual['j:iptcCopyrightNotice']).to.not.contain('www.iptc.org');
            });
        });

        it('reads the fields the two agree on', function () {
            propertiesOf(pathTo(jpeg), [
                'j:iptcObjectName',
                'j:iptcHeadline',
                'j:iptcCaption',
                'j:iptcCredit',
                'j:iptcCity',
                'j:iptcSublocation',
                'j:iptcCountry'
            ]).then(actual => {
                expect(actual).to.deep.equal({
                    'j:iptcObjectName': 'The Title (ref2024.1)',
                    'j:iptcHeadline': 'The Headline (ref2024.1)',
                    'j:iptcCaption': 'The description aka caption (ref2024.1)',
                    'j:iptcCredit': 'Credit Line (ref2024.1)',
                    'j:iptcCity': 'City (Core) (ref2024.1)',
                    'j:iptcSublocation': 'Sublocation (Core) (ref2024.1)',
                    'j:iptcCountry': 'Country (Core) (ref2024.1)'
                });
            });
        });

        it('takes the XMP date, which is the one carrying a timezone', function () {
            // IIM holds 20240322, XMP holds the ISO form. Worth its own assertion: the two are the
            // same instant, so a reader that silently took IIM would still look plausible.
            propertiesOf(pathTo(jpeg), ['j:iptcDateCreated']).then(actual => {
                expect(actual['j:iptcDateCreated']).to.contain('2024-03-22');
                expect(actual['j:iptcDateCreated']).to.not.equal('20240322');
            });
        });
    });

    describe('a PNG carrying only a raw IPTC profile', () => {
        // The fixture is a real PNG with its XMP chunk removed, so every value below can only have
        // come through PngRawIptcProfile: zTXt inflate, hex decode, 8BIM unwrap, IIM parse. With
        // XMP present these fields would be indistinguishable, since it carries the same ones.
        it('reads the values out of the zTXt profile', function () {
            propertiesOf(pathTo(png), [
                'j:iptcByline',
                'j:iptcCaption',
                'j:iptcCaptionWriter',
                'j:iptcCity',
                'j:iptcHeadline',
                'j:iptcSource'
            ]).then(actual => {
                expect(actual).to.deep.equal({
                    'j:iptcByline': 'clement exif creator',
                    'j:iptcCaption': 'description quel norme ?',
                    'j:iptcCaptionWriter': 'xmp photoshop captionWriter',
                    'j:iptcCity': 'Barcelona, iptc',
                    // The profile holds a trailing space; the extractor trims it
                    'j:iptcHeadline': 'iptc headline.',
                    'j:iptcSource': 'ptc source'
                });
            });
        });

        it('proves the value came from IIM rather than a leftover XMP packet', function () {
            // The unedited original carries "copyright en XMP" here. Seeing the IIM value instead
            // is what says the raw profile was read.
            propertiesOf(pathTo(png), ['j:iptcByline']).then(actual => {
                expect(actual['j:iptcByline']).to.equal('clement exif creator');
                expect(actual['j:iptcByline']).to.not.contain('XMP');
            });
        });
    });
});
