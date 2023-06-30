import {JContent} from '../page-object';

describe('Menu tests', () => {
    beforeEach(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
        cy.loginEditor(); // Edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Validate structured view columns are not sortable', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.getTable().getHeaderByRole('name').isSortable();
        jcontent.switchToStructuredView();
        jcontent.getTable().getHeaderByRole('name').isNotSortable();
    });
});
