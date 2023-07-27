import {JContent} from '../../../page-object';

describe('Lock tests', () => {
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
                .get().find('[data-cm-role="table-content-list-cell-name"]').click();
            cy.get('[data-sel-role=preview-type-image]');
            cy.get('[data-cm-role=preview-name]').contains('street-market-fruits-grocery.jpg');
        });

        it('can be closed', () => {
            cy.get('[data-cm-role=preview-drawer-close]').click();
            cy.get('[data-cm-role=preview-name]').should('not.exist');
        });
    });
});
