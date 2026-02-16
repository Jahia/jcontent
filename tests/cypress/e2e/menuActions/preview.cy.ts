import {JContent} from '../../page-object';

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
            cy.get('[data-sel-role=preview-type-content]');
            cy.get('[data-cm-role=preview-name]').contains('Taber');
        });

        it('can be closed', () => {
            cy.get('[data-cm-role=preview-drawer-close]').click();
            cy.get('[data-cm-role=preview-name]').should('not.exist');
        });
    });

    describe('test preview in media tab', {testIsolation: false}, () => {
        let jcontent;

        it('shows preview on PDF', () => {
            jcontent = JContent.visit('digitall', 'en', 'media/files/images/pdf');
            jcontent
                .getGrid()
                .getCardByName('Digitall Financial Report.pdf')
                .contextMenu()
                .select('Preview');
            cy.get('[data-sel-role=preview-type-pdf]').should('be.visible');
            cy.get('[data-cm-role=preview-name]').contains('Digitall Financial Report');
        });

        it('shows preview on files', () => {
            jcontent = JContent.visit('digitall', 'en', 'media/files/images/banners');
            jcontent
                .getGrid()
                .getCardByLabel('editing')
                .contextMenu()
                .select('Preview');
            cy.get('[data-sel-role=preview-type-image]');
            cy.get('[data-cm-role=preview-name]').contains('editing-digitall-site.jpg');
        });

        it('can select another item', () => {
            jcontent
                .getGrid()
                .getCardByLabel('dance')
                .get().scrollIntoView().find('[data-cm-role="grid-content-list-card-name"]').scrollIntoView().click();
            cy.get('[data-sel-role=preview-type-image]');
            cy.get('[data-cm-role=preview-name]').contains('dance-scene-free-license-cc0.jpg');
        });

        it('can switch to list view', () => {
            jcontent.switchToListMode();
            cy.get('[data-sel-role=preview-type-image]');
            cy.get('[data-cm-role=preview-name]').contains('dance-scene-free-license-cc0.jpg');
        });

        it('can select another item', () => {
            jcontent
                .getTable()
                .getRowByLabel('street')
                .get().find('[data-cm-role="table-content-list-cell-nameBigIcon"]').click();
            cy.get('[data-sel-role=preview-type-image]');
            cy.get('[data-cm-role=preview-name]').contains('street-market-fruits-grocery.jpg');
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
            cy.contains('[role="option"]', "10").click();

            // Open preview
            jcontent.getTable().getRowByName('how-to-use-this-demo').contextMenu().select('Preview');
            cy.get('[data-cm-role=preview-name]').contains('How to Use This Demo');

            // Switch to next page then check preview
            cy.get('[data-sel-role="table-pagination-button-next-page"]').click();
            cy.get('[data-cm-role="preview-drawer"]')
                .contains('Select a content item to preview it')
                .should('be.visible');
        });
    });
});
