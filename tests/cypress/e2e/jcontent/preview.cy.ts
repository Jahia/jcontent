import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {enableModule} from '@jahia/cypress';

describe('JContent preview tests', () => {
    beforeEach(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        enableModule('jcontent-test-module', 'jcontentSite');
        cy.loginAndStoreSession(); // Edit in chief
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.publishAll();
        cy.get('button[data-sel-role="openInLive"]', {timeout: 5000}).should('be.visible');
    });

    // TODO find alternative for missing preview context menu
    it.skip('should honor the j:view property when previewing content', () => {
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

    // TODO find alternative for missing preview context menu
    it.skip('should show cm view if available and no default', () => {
        cy.apollo({
            mutation: gql`mutation {
                            jcr {
                                mutateNode(pathOrId: "/sites/jcontentSite/home/area-main") {
                                    addChild(name: "test-no-default", primaryNodeType: "cent:noDefaultView") {
                                        uuid
                                    }
                                }
                            }
                        }`
        });

        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByLabel('test-no-default').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<div>No default view</div>');
    });

    afterEach(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });
});
