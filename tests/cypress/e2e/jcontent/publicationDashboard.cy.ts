import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Publication dashboard tests', () => {
    const siteKey = 'jcontentPublicationSite';

    before(function () {
        createSite(siteKey);
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Allows publication with Publication dashboard', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        const pageAccordion = jcontent.getAccordionItem('pages');
        let menu = pageAccordion.getTreeItem('home').contextMenu();
        menu = menu.submenu('Publish', 'jcontent-publishMenu');
        menu.should('be.visible');
        menu.select('Publication dashboard');
        cy.get('div[class=" x-grid3-check-col x-grid3-cc-publicationInfos-en x-component"]').first().click();
        cy.get('button').contains('Publish').click({force: true});
        jcontent.clickPublishNow();
        cy.get('div[id="notistack-snackbar"]', {timeout: 5000})
            .contains('Publication completed', {timeout: 5000})
            .should('be.visible');
    });
});
