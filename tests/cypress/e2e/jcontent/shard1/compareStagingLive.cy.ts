import {JContent} from '../../../page-object';
import {addNode, createSite, deleteSite, publishAndWaitJobEnding} from '@jahia/cypress';
import {createContentMutation} from '../../../utils/jcontent/jContentUtils';

describe('Compare staging/live tests', () => {
    const siteKey = 'compareStagingLiveTests';
    const path = `pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/${siteKey}/home)))`;

    beforeEach(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            locale: 'en',
            serverName: new URL(Cypress.config('baseUrl')).hostname
        });
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

    // To be fixed in https://github.com/Jahia/jcontent/issues/2115#issuecomment-5050884505
    it.skip('should publish', () => {
        const jcontent = JContent.visit(siteKey, 'en', path);
        const compareDialog = jcontent.getCompareDialog();
        compareDialog.get().get('h1').contains('Compare staging vs live version').should('exist');
        compareDialog.getStagingFrame().find('div').contains('test added').should('exist');
        compareDialog.getLiveFrame().find('div').contains('test added').should('not.exist');
        compareDialog.publish();
        compareDialog.getLiveFrame().then($body => {
            const href = $body[0].ownerDocument.location.href;
            cy.log('live frame url:', href);
            expect(href).to.include(new URL(Cypress.config('baseUrl')).hostname);
        });
        compareDialog.getLiveFrame().find('div[class="col-md-12"]').contains('test added', {timeout: 2000}).should('exist');
    });
});
