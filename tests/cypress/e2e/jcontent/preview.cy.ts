import {JContent} from '../../page-object';

describe('JContent preview tests', () => {
    beforeEach(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.loginAndStoreSession(); // Edit in chief
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
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home#(jcontent:(compareDialog:(open:!t,path:/sites/jcontentSite/home)))');
        cy.get('h1').contains('Compare staging vs live version').should('exist');
    });

    afterEach(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });
});
