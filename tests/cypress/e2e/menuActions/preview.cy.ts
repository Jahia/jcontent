import {JContent} from '../../page-object';
import {createSite, deleteSite, uploadFile} from '@jahia/cypress';

describe('Menu actions preview tests', () => {
    before(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
    });

    describe('test preview in content tab', {testIsolation: false}, () => {
        it('shows preview on content folder item', () => {
            const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByLabel('Taber')
                .contextMenu()
                .select('Preview');
            cy.get('[data-preview-type="content"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').contains('Taber');
        });

        it('can be closed', () => {
            cy.get('[data-cm-role=preview-drawer-close]').click();
            cy.get('[data-cm-role=preview-name]').should('not.exist');
        });
    });

    describe('test preview in media tab', {testIsolation: false}, () => {
        const siteKey = 'previewMediaSite';
        let jcontent: JContent;

        before(() => {
            createSite(siteKey);
            uploadFile('/assets/uploadMedia/myfile.pdf', `/sites/${siteKey}/files`, 'myfile.pdf', 'application/pdf');
            uploadFile('/assets/uploadMedia/myfile.png', `/sites/${siteKey}/files`, 'myfile.png', 'image/png');
            uploadFile('/assets/uploadMedia/myfile2.png', `/sites/${siteKey}/files`, 'myfile2.png', 'image/png');
            uploadFile('/assets/uploadMedia/myfile.webm', `/sites/${siteKey}/files`, 'myfile.webm', 'video/webm');
            uploadFile('/assets/uploadMedia/myfile.csv', `/sites/${siteKey}/files`, 'myfile.csv', 'text/csv');
            uploadFile('/assets/uploadMedia/myfile.docx', `/sites/${siteKey}/files`, 'myfile.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        });

        after(() => {
            deleteSite(siteKey);
        });

        it('shows PDF preview', () => {
            jcontent = JContent.visit(siteKey, 'en', 'media/files');
            jcontent.getGrid().getCardByName('myfile.pdf').contextMenu().select('Preview');
            cy.get('[data-preview-type="pdf"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.pdf');
        });

        it('shows image preview when selecting png', () => {
            jcontent.getGrid().getCardByName('myfile.png')
                .get().scrollIntoView().find('[data-cm-role="grid-content-list-card-name"]').scrollIntoView().click();
            cy.get('[data-preview-type="image"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.png');
        });

        it('can select another image', () => {
            jcontent.getGrid().getCardByName('myfile2.png')
                .get().scrollIntoView().find('[data-cm-role="grid-content-list-card-name"]').scrollIntoView().click();
            cy.get('[data-preview-type="image"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile2.png');
        });

        it('can switch to list view and preview persists', () => {
            jcontent.switchToListMode();
            cy.get('[data-preview-type="image"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile2.png');
        });

        it('can select another item from list view', () => {
            jcontent.getTable().getRowByName('myfile.png')
                .get().find('[data-cm-role="table-content-list-cell-nameBigIcon"]').click();
            cy.get('[data-preview-type="image"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.png');
        });

        it('shows video preview for webm', () => {
            jcontent.getTable().getRowByName('myfile.webm').contextMenu().select('Preview');
            cy.get('[data-preview-type="media"]').should('be.visible');
            cy.get('[data-preview-type="media"]').find('video').should('exist');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.webm');
        });

        it('shows document preview for csv', () => {
            jcontent.getTable().getRowByName('myfile.csv').contextMenu().select('Preview');
            cy.get('[data-preview-type="document"]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.csv');
        });

        it('shows document preview for docx', () => {
            jcontent.getTable().getRowByName('myfile.docx').contextMenu().select('Preview');
            cy.get('[data-preview-type="document"]').should('exist').and('be.visible');
            cy.get('[data-cm-role=preview-name]').should('contain', 'myfile.docx');
        });

        it('can be closed', () => {
            cy.get('[data-cm-role=preview-drawer-close]').click();
            cy.get('[data-cm-role=preview-name]').should('not.exist');
        });
    });

    describe('Test preview in pages tab', {testIsolation: false}, () => {
        it('Can close preview when using pagination', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home');
            jcontent.switchToListMode();

            // Open pagination ans select 10 items per page
            cy.get('[data-sel-role="table-pagination-dropdown-rows-per-page"]').click();
            cy.get('menu.moonstone-menu[role="list"]').should('be.visible');
            cy.contains('[role="option"]', '10').click();

            // Open preview
            jcontent.getTable().getRowByName('how-to-use-this-demo').contextMenu().select('Preview');
            cy.get('[data-cm-role=preview-name]').contains('How to Use This Demo');

            // Switch to next page then check preview
            cy.get('[data-sel-role="table-pagination-button-next-page"]').click();
            cy.get('[data-sel-role="side-panel-content"]')
                .contains('Select a content item to preview it')
                .should('be.visible');
        });
    });
});
