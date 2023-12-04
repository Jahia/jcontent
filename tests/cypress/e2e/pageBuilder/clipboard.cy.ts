import {JContent, JContentPageBuilder} from '../../page-object';

describe('Page builder', () => {
    let jcontent: JContentPageBuilder;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageBuilder();
    });

    describe('clipboard', function () {
        it('should show paste button when we copy', function () {
            jcontent.refresh();

            // Context menu does not show up; wait necessary
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(3000);

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu(true);
            menu.select('Copy');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('Paste');
            buttons.getButton('Paste as reference');
        });

        it('remove paste button when we clear clipboard', function () {
            jcontent.refresh();

            // Context menu does not show up; wait necessary
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(3000);

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu(true);
            menu.select('Copy');

            // Clearing selection should keep paste buttons
            let buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('Paste');
            buttons.getButton('Paste as reference');
            jcontent.clearClipboard();

            buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
            buttons.assertHasNoButtonForType('Paste');
            buttons.assertHasNoButtonForType('Paste as reference');
        });
    });
});
