import {contentTypes} from '../../fixtures/contentEditor/pickers/contentTypes';
import {JContent} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

/**
 * The "Show image metadata" entry on an image reference field, and the dialog behind it.
 *
 * The entry is deliberately conditional — it appears only for an image that carries EXIF or
 * XMP/IPTC — so both the present and the absent case are asserted here. Without the absent case a
 * regression that always shows the entry would go unnoticed until an editor opened it onto nothing.
 */
describe('Picker tests - image metadata', () => {
    const siteKey = 'pickerImageMetadata';
    const withMetadata = 'iptc-xmp-test.webp';
    const withoutMetadata = 'myfile.png';

    before('setup', () => {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        cy.loginAndStoreSession();

        const media = JContent.visit(siteKey, 'en', 'media/files').getMedia().open();
        media.uploadFileViaDialog(withMetadata, 'assets');
        media.uploadFileViaDialog(withoutMetadata, 'assets/uploadMedia');
    });

    after('teardown', () => {
        deleteSite(siteKey);
        cy.logout();
    });

    const pickImage = (fileName: string) => {
        const field = JContent.visit(siteKey, 'en', 'content-folders/contents')
            .createContent(contentTypes.imagepicker.typeName)
            .getPickerField(contentTypes.imagepicker.fieldNodeType, contentTypes.imagepicker.multiple);

        const picker = field.open();
        picker.getAccordionItem('picker-media').click();
        picker.wait();
        picker.getTable().getRowByName(fileName).get().should('be.visible').click();
        picker.select();
        field.assertValue(fileName);
        return field;
    };

    it('offers the entry for an image carrying metadata', () => {
        pickImage(withMetadata).openMenu().shouldHaveItem('Show image metadata');
    });

    it('does not offer the entry for an image carrying none', () => {
        pickImage(withoutMetadata).openMenu().shouldNotHaveItem('Show image metadata');
    });

    it('lists the values read out of the image', () => {
        pickImage(withMetadata).openMenu().select('Show image metadata');

        cy.get('[data-sel-role="image-metadata-dialog"]').should('be.visible').within(() => {
            cy.get('[data-sel-content="jmix:iptc"]').should('exist');
            cy.get('[data-sel-role="detail-row"]').should('have.length.greaterThan', 0);
            cy.contains('webp caption').should('be.visible');
            cy.contains('clement egger').should('be.visible');
            // Non-ASCII survives the whole path, binary to dialog
            cy.contains('Zürich webp city').should('be.visible');
        });
    });

    it('copies the value and closes in the same click', () => {
        // The clipboard itself is stubbed rather than read back: a real read needs a permission
        // Cypress cannot grant headlessly, and what matters here is the value handed over and the
        // dialog getting out of the way afterwards.
        const copied = cy.stub().as('writeText').resolves();
        cy.window().then(win => {
            cy.stub(win.navigator.clipboard, 'writeText').callsFake(copied);
        });

        pickImage(withMetadata).openMenu().select('Show image metadata');

        cy.get('[data-sel-role="image-metadata-dialog"]')
            .should('be.visible')
            .find('[data-sel-label="Description"], [data-sel-label="Caption"]')
            .first()
            .find('[data-sel-role="copy-value"]')
            .click();

        cy.get('@writeText').should('have.been.calledWith', 'webp caption');
        cy.get('[data-sel-role="image-metadata-dialog"]').should('not.exist');
    });
});
