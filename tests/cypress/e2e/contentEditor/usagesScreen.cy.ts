import {ContentEditor, JContent} from '../../page-object';
import {BaseComponent, createSite, deleteSite, Dropdown, getComponentByRole} from '@jahia/cypress';

describe('Create content tests', () => {
    let jcontent: JContent;
    const usagesSite = 'usagesSite';

    before(function () {
        cy.apollo({
            mutationFile: 'contentEditor/usages/createUsages.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents'
            }
        });
        cy.loginAndStoreSession();
    });

    after(function () {
        cy.logout();
        cy.apollo({
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents/ce-usages-contents'
            }
        });
        deleteSite(usagesSite);
    });

    it('display 16 usages', () => {
        jcontent = JContent.visit('digitall', 'en', 'media/files/images/backgrounds');
        jcontent.switchToListMode().getTable().getRowByLabel('boy-father.jpg').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.checkOption('Usages', '16');
        advancedOptions.switchToOption('Usages');
        cy.get('table[data-cm-role="table-usages-list"]').as('usagesTable').should('be.visible');
        cy.get('@usagesTable').find('tbody > tr').should('have.length', 10);
        const usagesPaperComponent = getComponentByRole(BaseComponent, 'usages');
        usagesPaperComponent.get().should('be.visible');
        const pagination = getComponentByRole(Dropdown, 'table-pagination-dropdown-rows-per-page', usagesPaperComponent);
        pagination.select('20');
        cy.get('table[data-cm-role="table-usages-list"]').as('usagesTable2').should('be.visible');
        cy.get('@usagesTable2').find('tbody > tr').should('have.length', 16);
        // contentEditor.cancel();
    });

    it('displays 31 usages and restriction message', () => {
        createSite(usagesSite);
        cy.apollo({
            mutationFile: 'contentEditor/usages/createUsages.graphql',
            variables: {
                pathOrId: `/sites/${usagesSite}/contents`
            }
        });
        cy.logout();
        cy.login('bill', 'password');
        jcontent = JContent.visit('digitall', 'en', 'media/files/images/backgrounds');
        jcontent.switchToListMode().getTable().getRowByLabel('boy-father.jpg').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.checkOption('Usages', '31');
        advancedOptions.switchToOption('Usages');
        cy.get('table[data-cm-role="table-usages-list"]').as('usagesTable').should('be.visible');
        cy.get('@usagesTable').find('tbody > tr').should('have.length', 10);
        const usagesPaperComponent = getComponentByRole(BaseComponent, 'usages');
        usagesPaperComponent.get().should('be.visible');
        const pagination = getComponentByRole(Dropdown, 'table-pagination-dropdown-rows-per-page', usagesPaperComponent);
        pagination.select('20');
        cy.get('table[data-cm-role="table-usages-list"]').as('usagesTable2').should('be.visible');
        cy.get('@usagesTable2').find('tbody > tr').should('have.length', 16);
        cy.get('div').contains('This content is used in').should('exist');
        contentEditor.cancel();
    });
});
