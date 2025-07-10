import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Page builder - clipboard tests', () => {
    let jcontent: JContentPageBuilder;
    const siteKey = 'jcontentSite';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('should show paste button when we copy', function () {
        // We don't force right-click otherwise it might bring up page context menu
        const contentPath = `/sites/${siteKey}/home/area-main/test-content1`;
        const contextMenu = jcontent.getModule(contentPath).contextMenu(true);

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000); // Wait for the context menu to appear
        contextMenu.selectByRole('copy');
        cy.get('#message-id').contains('in the clipboard');

        const landingArea = jcontent.getModule(`/sites/${siteKey}/home/landing`);
        // LandingArea.click(); // Deselect copied content
        const buttons = landingArea.getCreateButtons();
        buttons.assertHasNoButtonForType('New content');
        buttons.getButton('Paste');
        buttons.getButton('Paste as reference');
    });

    it('should remove paste button when we clear clipboard', function () {
        // We don't force right-click otherwise it might bring up page context menu
        const contextMenu = jcontent.getModule(`/sites/${siteKey}/home/area-main/test-content1`, false).contextMenu(true);
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000); // Wait for the context menu to appear
        contextMenu.selectByRole('copy');
        cy.get('#message-id').contains('in the clipboard');

        // Clearing selection should keep paste buttons
        const landingArea = jcontent.getModule(`/sites/${siteKey}/home/landing`);
        // LandingArea.click(); // Deselect copied content
        let buttons = landingArea.getCreateButtons();
        buttons.assertHasNoButtonForType('New content');
        buttons.getButton('Paste');
        buttons.getButton('Paste as reference');
        jcontent.clearClipboard();

        jcontent.getModule(`/sites/${siteKey}/home/landing`).getCreateButtons();
        buttons = landingArea.getCreateButtons();
        buttons.getButton('New content');
        buttons.assertHasNoButtonForType('Paste');
        buttons.assertHasNoButtonForType('Paste as reference');
    });
});
