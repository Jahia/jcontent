import {JContent} from '../../page-object';
import {Picker} from '../../page-object/picker';
import {createSite, deleteSite, uploadFile} from '@jahia/cypress';

describe('Picker - Media - upload from inside the picker', () => {
    const siteKey = 'pickerUploadSite';

    before(() => {
        createSite(siteKey);
        // Seeds the files root: the picker has to open on a table, which is what an upload drops onto.
        uploadFile('/assets/uploadMedia/myfile.png', `/sites/${siteKey}/files`, 'seed.png', 'image/png');
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    const openImagePicker = (): Picker => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('cent:epSifeRestaurant');
        const picker = contentEditor.getPickerField('cemix:epSifeIllustrated_image').open();
        // The image picker opens on thumbnails; the upload drops onto the table the list view renders.
        picker.getViewMode().select('List');
        return picker;
    };

    it('Does not select a file uploaded from a picker that cannot accept it', () => {
        // The reported case: a pdf uploaded from an image picker ended up as the value of the field
        // with the select button enabled, even though clicking that same row does nothing.
        const picker = openImagePicker();

        picker.uploadFile('cypress/fixtures/assets/uploadMedia/myfile.pdf');
        cy.get('[data-cm-role="upload-status-success"]').should('be.visible');
        picker.getTable().getRowByLabel('myfile.pdf').should('be.visible');

        cy.get('[data-cm-role="selection-caption"] [data-sel-role="no-item-selected"]').should('exist');
        cy.get('button[data-sel-picker-dialog-action="done"]').should('be.disabled');
    });

    it('Selects a file uploaded from a picker that accepts it', () => {
        // The convenience the gate has to leave intact.
        const picker = openImagePicker();

        picker.uploadFile('cypress/fixtures/assets/uploadMedia/myfile2.png');
        cy.get('[data-cm-role="upload-status-success"]').should('be.visible');

        picker.getSelectionCaption().should('contain', 'myfile2.png');
        cy.get('button[data-sel-picker-dialog-action="done"]').should('not.be.disabled');
    });
});
