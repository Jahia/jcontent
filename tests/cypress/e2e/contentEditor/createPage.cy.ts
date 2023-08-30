import {PageComposer} from '../../page-object/pageComposer';
import {enableModule, getNodeByPath} from '@jahia/cypress';

describe('Page creation test', () => {
    const site = 'contentEditorSite';
    let pageComposer: PageComposer;

    before(function () {
        cy.loginAndStoreSession();
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: site});
        enableModule('content-editor-test-module', site);
    });

    after(function () {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: site});
        cy.logout();
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Should have called a rule on page creation with localized values', function () {
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
        pageComposer.createPage('Simple page');
        getNodeByPath('/sites/contentEditorSite/home/simple-page', ['jcr:description'], 'en').its('data.jcr.nodeByPath.properties').then(properties => {
            const description = properties.find(property => property.name === 'jcr:description');
            expect(description.value).to.equal('Simple page');
        });
    });
});
