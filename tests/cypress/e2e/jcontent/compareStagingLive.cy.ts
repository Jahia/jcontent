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
        cy.apollo({mutation: addContent});
    });

    it('should open preview with url', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().should('be.visible');
        compareDialog.getLiveFrame().should('be.visible');
    });

    it('should highlight changes staging vs live', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('exist');
        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('not.exist');
    });

    it('should refresh to original state', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('exist');
        compareDialog.refresh();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('not.exist');
    });

    afterEach(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });
});
