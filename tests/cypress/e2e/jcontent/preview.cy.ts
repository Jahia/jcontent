import {JContent} from '../../page-object';
import gql from 'graphql-tag';

describe('JContent preview tests', () => {
    const addContent = gql`mutation MyMutation {
  jcr {
    addNode(
      name: "addedNode"
      parentPathOrId: "/sites/jcontentSite/home/area-main"
      primaryNodeType: "jnt:bigText"
      properties: { name: "text", language: "en", value: "test added" }
    ) {
      uuid
    }
  }
}`;

    beforeEach(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.loginAndStoreSession(); // Edit in chief
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.publishAll();
        cy.get('button[data-sel-role="openInLive"]', {timeout: 5000}).should('be.visible');
    });

    it('should honor the j:view property when previewing content', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByLabel('test 6').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<a target="" href="/cms/render/default/en/sites/jcontentSite/home/area-main/test-content6-linkview.html">test-content6-linkview</a>');

        cy.get('button[data-cm-role="preview-drawer-close"]').click();
        jcontent.getTable().getRowByLabel('test 7').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body.textContent')
            .should('equal',
                'test 7');
    });

    it('should open preview with url', () => {
        JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        cy.get('h1').contains('Compare staging vs live version').should('exist');
        cy.get('iframe[data-sel-role="staging-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible');
        cy.get('iframe[data-sel-role="live-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible');
    });

    it('should highlight changes staging vs live', () => {
        cy.apollo({mutation: addContent});
        JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        cy.get('h1').contains('Compare staging vs live version').should('exist');
        cy.get('button[data-sel-role="highlight"]').should('be.visible').click();
        cy.get('iframe[data-sel-role="staging-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .contains('span[class="diff-html-added"]');
        cy.get('button[data-sel-role="highlight"]').should('be.visible').click();
        cy.get('iframe[data-sel-role="staging-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .contains('span[class="diff-html-added"]')
            .should('not.exist');
    });

    afterEach(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });
});
