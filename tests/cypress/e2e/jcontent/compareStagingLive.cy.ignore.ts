import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, publishAndWaitJobEnding} from '@jahia/cypress';
import {createContentMutation} from '../../utils/jcontent/jContentUtils';

describe('Compare staging/live tests', () => {
    const siteKey = 'compareStagingLiveTests';
    const path = `pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/${siteKey}/home)))`;

    beforeEach(() => {
        createSite(siteKey);
        cy.apollo({mutation: createContentMutation(siteKey)});
        publishAndWaitJobEnding(`/sites/${siteKey}`);
        addNode({
            parentPathOrId: `/sites/${siteKey}/home/area-main`,
            name: 'addedNode',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', language: 'en', value: 'test added'}]
        });
        cy.loginAndStoreSession(); // Edit in chief
    });

    afterEach(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should open preview with url', () => {
        const jcontent = JContent.visit(siteKey, 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().should('be.visible');
        compareDialog.getLiveFrame().should('be.visible');
    });

    it('should highlight changes staging vs live', () => {
        const jcontent = JContent.visit(siteKey, 'en', path);
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
        const jcontent = JContent.visit(siteKey, 'en', path);
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
        const jcontent = JContent.visit(siteKey, 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().find('div').contains('test added').should('exist');
        compareDialog.getLiveFrame().find('div').contains('test added').should('not.exist');
        compareDialog.publish();
        compareDialog.getLiveFrame().find('div[class="col-md-12"]').contains('test added', {timeout: 2000}).should('exist');
    });
});
