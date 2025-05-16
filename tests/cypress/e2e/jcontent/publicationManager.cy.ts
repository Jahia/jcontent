import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Publication manager tests', () => {
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

    it('Allows publication with Publication manager', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        // If run on Jahia that doesn't have access to PM this will fail although the action is designed to handle such case
        // and technically no strong dependency is required for jcontent operation
        cy.window()
            .its('authoringApi.showPublicationManager')
            .should('exist')
            .then(() => {
                const pageAccordion = jcontent.getAccordionItem('pages');
                let menu = pageAccordion.getTreeItem('home').contextMenu();
                menu = menu.submenu('Publish', 'jcontent-publishMenu');
                menu.should('be.visible');
                menu.select('Publication manager');
                cy.get('div[class=" x-grid3-check-col x-grid3-cc-publicationInfos-en x-component"]').first().click();
                cy.get('.publication-manager-engine').find('button').contains('Publish').click();
                jcontent.clickPublishNow();
                cy.get('div[id="notistack-snackbar"]', {timeout: 5000})
                    .contains('Publication completed', {timeout: 5000})
                    .should('be.visible');
            });
    });
});
