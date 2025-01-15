import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {publishAndWaitJobEnding} from '@jahia/cypress';

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

    const path = 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))';

    beforeEach(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        publishAndWaitJobEnding('/sites/jcontentSite');
        cy.apollo({mutation: addContent});
        cy.loginAndStoreSession(); // Edit in chief
    });

    it('should open preview with url', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().should('be.visible');
        compareDialog.getLiveFrame().should('be.visible');
    });

    it('should highlight changes staging vs live', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');

        // Wait until frames are loaded before proceeding
        compareDialog.getStagingFrame();
        compareDialog.getLiveFrame();

        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('exist');
        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('not.exist');
    });

    it('should refresh to original state', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');

        // Wait until frames are loaded before proceeding
        compareDialog.getStagingFrame();
        compareDialog.getLiveFrame();

        compareDialog.highlightToggle();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('exist');
        compareDialog.refresh();
        compareDialog.getStagingFrame().find('span[class="diff-html-added"]').should('not.exist');
    });

    it('should publish', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().find('div').contains('test added').should('exist');
        compareDialog.getLiveFrame().find('div').contains('test added').should('not.exist');
        compareDialog.publish();
        compareDialog.getLiveFrame().find('div[class="col-md-12"]').contains('test added', {timeout: 2000}).should('exist');
    });

    afterEach(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });
});
