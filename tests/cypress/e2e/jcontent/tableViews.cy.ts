import {JContent} from '../../page-object';

describe('Table view tests', () => {
    beforeEach(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
        cy.loginAndStoreSession(); // Edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Validate structured view columns are not sortable', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getHeaderByRole('name').isSortable();
        jcontent.switchToStructuredView();
        jcontent.getTable().getHeaderByRole('name').isNotSortable();
    });

    it('Check we display size file in Media list view', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();
        cy.get('[data-cm-role="table-content-list-cell-fileSize"]')
            .should('be.visible')
            .and('contain', '142.64 KB');
    });
});
