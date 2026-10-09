import {JContent} from '../../page-object';
import {Picker} from '../../page-object/picker';
import {createSite, deleteSite, enableModule, uploadFile} from '@jahia/cypress';

describe('Picker - Media - upload from inside the picker', () => {
    const siteKey = 'pickerUploadSite';

    before(() => {
        createSite(siteKey);
        // The type carrying the image picker, cent:epSifeRestaurant, comes from the test module.
        enableModule('jcontent-test-module', siteKey);
        // Seeds the files root: the picker has to open on a table, which is what the rows assert against.
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
        // The image picker opens on thumbnails; the list view renders the table the rows assert against.
        picker.getViewMode().select('List');
        // Pins where the upload is about to land. If the picker ever opens somewhere other than the
        // files root, this fails here and says so, rather than the upload going somewhere unwatched.
        picker.getTable().getRowByLabel('seed.png').should('be.visible');
        return picker;
    };

    // Goes through the toolbar rather than a drag and drop: dropping onto an image picker is filtered
    // by mime type before the upload starts, while the toolbar accepts any file - which is how the
    // reported case arose in the first place.
    const uploadFromToolbar = (fixture: string) => {
        cy.get('[data-sel-role="upload"]').should('be.visible').click();
        cy.get('#file-upload-input').selectFile(`cypress/fixtures/assets/uploadMedia/${fixture}`, {force: true});
        cy.get('[data-cm-role="upload-status-success"]', {timeout: 60000}).should('be.visible');
    };

    it('Does not select a file uploaded from a picker that cannot accept it', () => {
        // The reported case: a pdf uploaded from an image picker ended up as the value of the field
        // with the select button enabled, even though clicking that same row does nothing.
        const picker = openImagePicker();

        uploadFromToolbar('myfile.pdf');
        picker.wait();

        // The picker does not offer it, and it did not select itself on the way in either.
        picker.getTable().get().should('not.contain', 'myfile.pdf');
        cy.get('[data-cm-role="selection-caption"] [data-sel-role="no-item-selected"]').should('exist');
        cy.get('button[data-sel-picker-dialog-action="done"]').should('be.disabled');
    });

    it('Selects a file uploaded from a picker that accepts it', () => {
        // The convenience the gate has to leave intact.
        const picker = openImagePicker();

        uploadFromToolbar('myfile2.png');
        picker.wait();

        picker.getSelectionCaption().should('contain', 'myfile2.png');
        cy.get('button[data-sel-picker-dialog-action="done"]').should('not.be.disabled');
    });
});
