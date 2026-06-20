import {ContentEditor, JContent} from '../../page-object';
import gql from 'graphql-tag';
import {addNode, enableModule} from '@jahia/cypress';

describe('JContent preview tests', () => {
    const siteKey = 'jcontentSite';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        enableModule('jcontent-test-module', siteKey);
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
            properties: [{name: 'text', value: 'preview me', language: 'en'}]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it.only('should honor the j:view property when previewing content', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('test-content6-linkview').click();
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<a target="" href="/cms/render/default/en/sites/jcontentSite/home/area-main/test-content6-linkview.html">test-content6-linkview</a>');

        jcontent.getTable().getRowByName('test-content7-defaultview').click();
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

    it('should reflect edit workspace changes in preview', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        cy.log('Open preview and verify initial edit version is shown');
        jcontent.openPreview('previewText');
        cy.get('[data-sel-role="preview-container"]').should('be.visible');
        cy.get('[data-cm-role="preview-name"]').should('contain', 'preview me');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.text', 'preview me');

        cy.log('Edit content');
        jcontent.editComponentByRowName('previewText');
        const ce = new ContentEditor();
        ce.getSmallTextField('jnt:text_text').addNewValue('preview me edited');
        ce.save();

        cy.log('Reopen preview and verify edit workspace shows updated content');
        jcontent.openPreview('previewText');
        cy.get('[data-sel-role="preview-container"]').should('be.visible');
        cy.get('[data-cm-role="preview-name"]').should('contain', 'preview me edited');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.text', 'preview me edited');
    });
});
