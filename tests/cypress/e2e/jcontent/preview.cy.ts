import {ContentEditor, JContent} from '../../page-object';
import gql from 'graphql-tag';
import {addNode, enableModule, publishAndWaitJobEnding} from '@jahia/cypress';

describe('JContent preview tests', () => {
    const siteKey = 'jcontentSite';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        enableModule('jcontent-test-module', siteKey);
        publishAndWaitJobEnding(`/sites/${siteKey}/home`, ['en']);
        cy.apollo({
            mutation: gql`mutation {
                            jcr {
                                mutateNode(pathOrId: "/sites/${siteKey}/home/area-main") {
                                    addChild(name: "test-no-default", primaryNodeType: "cent:noDefaultView") {
                                        uuid
                                    }
                                }
                            }
                        }`
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewText',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'preview me', language: 'en'},]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('should honor the j:view property when previewing content', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('test-content6-linkview').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<a target="" href="/cms/render/default/en/sites/jcontentSite/home/area-main/test-content6-linkview.html">test-content6-linkview</a>');

        cy.get('button[data-cm-role="preview-drawer-close"]').click();
        jcontent.getTable().getRowByName('test-content7-defaultview').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body.textContent')
            .should('equal',
                'test 7');
    });

    it('should show cm view if available and no default', () => {

        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('test-no-default').contextMenu().select('Preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<div>No default view</div>');
    });

    it('should show correct preview version in live and edit', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        // Open preview
        jcontent.openPreview('previewText');
        cy.get('[data-sel-role=preview-type-content]').should('be.visible');
        cy.get('[data-cm-role=preview-name]').contains('preview me');

        // Verify live button is disabled
        cy.get('button[data-cm-role="live-preview-button"]')
            .should('exist')
            .and('be.disabled');
        cy.get('[data-cm-role=preview-drawer-close]').click();

        // Publish
        jcontent.getTable()
            .getRowByName('previewText')
            .contextMenu()
            .submenu('Publish', 'jcontent-publishMenu')
            .should('be.visible')
            .within(() => {
                cy.contains('span', 'Publish preview me - English').click();
            });
        jcontent.clickPublishNow();

        // Reopen preview
        jcontent.openPreview('previewText');
        cy.get('button[data-cm-role="live-preview-button"]').should('be.visible').click();
        cy.get('[data-cm-role=preview-name]').contains('preview me');
        cy.get('[data-cm-role=preview-drawer-close]').click();

        // Edit
        jcontent.editComponentByRowName('previewText');
        const ce = new ContentEditor();
        ce.getSmallTextField('jnt:text_text').addNewValue('preview me edited');
        ce.save();

        // Reopen preview
        jcontent.openPreview('previewText');
        cy.get('[data-sel-role=preview-type-content]').should('be.visible');
        cy.get('[data-cm-role=preview-name]').contains('preview me edited');
        cy.get('button[data-cm-role="live-preview-button"]').should('be.visible').click();
        cy.get('[data-cm-role=preview-name]').contains('preview me');
        cy.get('[data-cm-role=preview-drawer-close]').click();

        // Publish
        jcontent.getTable()
            .getRowByName('previewText')
            .contextMenu()
            .submenu('Publish', 'jcontent-publishMenu')
            .should('be.visible')
            .within(() => {
                cy.contains('span', 'Publish preview me edited - English').click();
            });
        jcontent.clickPublishNow();

        jcontent.openPreview('previewText');
        cy.get('button[data-cm-role="live-preview-button"]').should('be.visible').click();
        cy.get('[data-cm-role=preview-name]').contains('preview me edited');
        cy.get('[data-cm-role=preview-drawer-close]').click();

        // Unpublish
        jcontent.getTable()
            .getRowByName('previewText')
            .contextMenu()
            .submenu('Publish', 'jcontent-publishMenu')
            .should('be.visible')
            .within(() => {
                cy.contains('span', 'Unpublish preview me edited - English').click();
            });
        cy.contains('button', 'Unpublish').click();

        jcontent.openPreview('previewText');
        cy.get('[data-sel-role=preview-type-content]').should('be.visible');
        cy.get('[data-cm-role=preview-name]').contains('preview me edited');
        cy.get('button[data-cm-role="live-preview-button"]')
            .should('exist')
            .and('be.disabled');
        cy.get('[data-cm-role=preview-drawer-close]').click();

    });
});
