import {JContent, SidePanel} from '../../../page-object';

/**
 * The details tab showing what was read out of an uploaded binary. The adapter behind it is unit
 * tested (useFileMetadata.spec.js); what only a real run can show is that the tab is registered,
 * that the sections reach it, and that the labels resolve from the node type definitions rather
 * than appearing as raw property names.
 */
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

describe('jContent side panel - file metadata', () => {
    const sidePanel = new SidePanel();
    const withMetadata = 'iptc-xmp-test.webp';
    const withoutMetadata = 'myfile.png';
    const folder = 'media/files';

    const uploaded = (name: string) => `/sites/digitall/files/${name}`;

    before(() => {
        cy.loginAndStoreSession();
        const media = JContent.visit('digitall', 'en', folder).getMedia().open();
        mediaReadyToUpload();
        media.uploadFileViaDialog(withMetadata, 'assets');
        mediaReadyToUpload();
        media.uploadFileViaDialog(withoutMetadata, 'assets/uploadMedia');
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        [withMetadata, withoutMetadata].forEach(name => {
            cy.apollo({
                mutationFile: 'jcontent/jcrDeleteNode.graphql',
                variables: {pathOrId: uploaded(name)}
            });
        });
        cy.logout();
    });

    const openDetailsFor = (fileName: string) => {
        JContent.visit('digitall', 'en', folder)
            .switchToListMode()
            .getTable()
            .getRowByName(fileName)
            .contextMenu()
            .select('Preview');

        sidePanel.getByRole('side-panel').should('be.visible');
        return sidePanel.switchToDetailsTab();
    };

    it('shows the XMP/IPTC section for an image carrying metadata', () => {
        openDetailsFor(withMetadata);
        sidePanel.getDetailsSection('jmix:iptc')
            .should('be.visible')
            .and('contain.text', 'Available XMP/IPTC data');
    });

    it('labels each row from the node type definition rather than the property name', () => {
        openDetailsFor(withMetadata);

        // Labels come from jcontent_en.properties via the definition's displayName. A row keyed
        // 'j:iptcCaption' instead of 'Description' means that resolution has broken.
        sidePanel.getDetailRow('Description').should('contain.text', 'webp caption');
        sidePanel.getDetailRow('Description author').should('contain.text', 'clement egger');
        sidePanel.getDetailRow('Credit').should('contain.text', 'webp credit');
        sidePanel.getDetailRow('Copyright').should('contain.text', 'webp copyright notice');
        sidePanel.getDetailRow('Location').should('contain.text', 'france');
    });

    it('carries accented and non-latin values through to the panel', () => {
        openDetailsFor(withMetadata);
        sidePanel.getDetailRow('City').should('contain.text', 'Zürich webp city');
        sidePanel.getDetailRow('Source').should('contain.text', 'webp source — émile');
    });

    it('joins a multi-valued field into one readable row', () => {
        openDetailsFor(withMetadata);
        sidePanel.getDetailRow('Keywords')
            .should('contain.text', 'webp keyword one')
            .and('contain.text', 'webp keyword two');
    });

    it('shows no metadata section for a file carrying none', () => {
        openDetailsFor(withoutMetadata);

        // The details tab itself still works — only the metadata sections are absent, which is
        // what distinguishes "nothing to show" from "the tab failed to load".
        sidePanel.getDetailsSection('technical').should('be.visible');
        cy.get('[data-sel-role="details-section"][data-sel-content="jmix:iptc"]').should('not.exist');
        cy.get('[data-sel-role="details-section"][data-sel-content="jmix:exif"]').should('not.exist');
    });
});
