import {JContent, JContentPageBuilder} from '../../page-object';
import {Button, getComponentByRole} from '@jahia/cypress';
import {PageComposer} from '../../page-object/pageComposer';

describe('Links in jcontent', () => {
    let jcontent: JContentPageBuilder;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite2'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/createLinks.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
        cy.apollo({mutationFile: 'jcontent/disableLegacyPageComposer.graphql'});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite2'});
    });

    beforeEach(() => {
        cy.login();
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('Do not open modal when clicking on internal link', function () {
        jcontent.iframe().get().contains('internal-link').click();
        cy.get('div[role=dialog]').should('not.exist');
    });

    it('Open modal when clicking on other site link', function () {
        jcontent.iframe().get().contains('other-site-link').click();
        cy.get('div[role=dialog]');
        cy.contains('You are opening a link to a different website: jcontentSite2');
        getComponentByRole(Button, 'cancel').click();
    });

    it('Open modal when clicking on external link', function () {
        jcontent.iframe().get().contains('external-link').click({force: true});
        cy.get('div[role=dialog]');
        cy.contains('You are leaving Jahia. Do you want to open the external URL in a new tab');
        getComponentByRole(Button, 'cancel').click();
    });

    it('Should open link modal and edit page when clicking on same site link from left navigation', {retries: 3}, () => {
        const pageAccordion = jcontent.getAccordionItem('pages');
        pageAccordion.expandTreeItem('home');
        pageAccordion.getTreeItem('internal-link-nav').click();

        cy.log('Click on edit button');
        const dialogCss = '[data-sel-role="link-content-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Internal link')
            .and('contain', '/sites/jcontentSite/home')
            .and('not.contain', 'of the site');

        // Generation of registry action takes a bit of time and makes this test a bit flaky; add wait
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.get(dialogCss)
            .find('[data-sel-role="edit"]')
            .should('contain', 'Edit')
            .click();

        cy.log('Verify edit dialog is opened');
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Home');
        getComponentByRole(Button, 'backButton').click();
    });

    it('Should open link modal and edit page when clicking on other site link from left navigation', () => {
        const pageAccordion = jcontent.getAccordionItem('pages');
        pageAccordion.expandTreeItem('home');
        pageAccordion.getTreeItem('other-site-link-nav').click();

        cy.log('Click on edit button');
        const dialogCss = '[data-sel-role="link-content-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Internal link')
            .and('contain', '/sites/jcontentSite2/home')
            .and('contain', 'of the site');

        // Generation of registry action takes a bit of time and makes this test a bit flaky; add wait
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.get(dialogCss)
            .find('[data-sel-role="edit"]')
            .should('contain', 'Edit')
            .click();

        cy.log('Verify edit dialog is opened');
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Home');
        getComponentByRole(Button, 'backButton').click();
    });

    it('Should open link modal when clicking on external link from left navigation', () => {
        const pageAccordion = jcontent.getAccordionItem('pages');
        pageAccordion.expandTreeItem('home');
        pageAccordion.getTreeItem('external2-link-nav').click();

        cy.log('Click on edit button');
        const dialogCss = '[data-sel-role="link-content-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'External link')
            .and('contain', 'www.google.com');

        // Generation of registry action takes a bit of time and makes this test a bit flaky; add wait
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.get(dialogCss)
            .find('[data-sel-role="edit"]')
            .should('contain', 'Edit')
            .click();

        cy.log('Verify edit dialog is opened');
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'external2-link-nav');
        getComponentByRole(Button, 'backButton').click();
    });

    it('Trying to access legacy page composer redirect to page builder', () => {
        PageComposer.visit('jcontentSite', 'en', 'home.html');
        jcontent.switchToListMode().getTable().getRowByLabel('test-content5');
        PageComposer.visit('digitall', 'en', 'home/demo-roles-and-users.html');
        cy.url().should('include', '/jahia/jcontent/digitall/en/pages/home/demo-roles-and-users');
        jcontent.switchToListMode().getTable().getRowByLabel('How to use this demonstration? You can discover Jahia 7 using the following users (login / password): root / root (if you\'re using the Demo Pack. Otherwise, the root password is the one set using the Jahia');
    });
});
