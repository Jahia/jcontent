import {JContent, JContentPageComposer} from '../page-object';
import {Button, getComponentByRole} from '@jahia/cypress';

describe('Links in jcontent', () => {
    let jcontent: JContentPageComposer;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite2'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/createLinks.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
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
            .switchToPageComposer();
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
        jcontent.iframe().get().contains('external-link').click();
        cy.get('div[role=dialog]');
        cy.contains('You are leaving Jahia. Do you want to open the external URL in a new tab');
        getComponentByRole(Button, 'cancel').click();
    });
});
