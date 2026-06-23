import {ContentEditor, JContent, SidePanel} from '../../page-object';
import {addNode, deleteNode, enableModule} from '@jahia/cypress';

describe('JContent preview tests', () => {
    const siteKey = 'jcontentSite';
    const sidePanel = new SidePanel();

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        enableModule('jcontent-test-module', siteKey);

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'test-no-default',
            primaryNodeType: 'cent:noDefaultView'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewText',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'preview me', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewPerson',
            primaryNodeType: 'jnt:person',
            properties: [{name: 'firstname', value: 'Preview'}, {name: 'lastname', value: 'Person'}]
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
        jcontent.getTable().getRowByName('test-content6-linkview').click();
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<a target="" href="/cms/render/default/en/sites/jcontentSite/home/area-main/test-content6-linkview.html">test-content6-linkview</a>');

        jcontent.getTable().getRowByName('test-content7-defaultview').click();
        sidePanel.switchToTab('tab-preview');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body.textContent')
            .should(text => {
                expect(text.replace(/\s+/g, ' ').trim()).to.equal('test 7');
            });
    });

    it('should show cm view for out-of-context preview if available and no default', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.openPreview('test-no-default');
        cy.get('[data-sel-role="preview-container"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .should('contain.html',
                '<div>No default view</div>');
    });

    it('should zoom to the specific sub-component and remove siblings when previewing in pages mode', () => {
        // Test-content1, test-content2, test-content3 are siblings in home/area-main.
        // In pages mode, the in-context render loads the full page and zooms to the target —
        // only the target component's text should be visible after removeSiblings.
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('test-content1').click();
        sidePanel.switchToTab('tab-preview');

        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.text', 'test 1')
            .and('not.contain.text', 'test 2')
            .and('not.contain.text', 'test 3');
    });

    it('should inject page CSS into out-of-context module renders via cssSourcePath', () => {
        // Out-of-context: node in content-folders renders as contextConfiguration=module.
        // cssSourcePath triggers a secondary page fetch to extract <head> CSS,
        // which IframeViewer injects into the iframe — the head should have link[rel=stylesheet].
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.openPreview('previewPerson');

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const links = $iframe[0].contentDocument.head.querySelectorAll('link[rel="stylesheet"]');
            expect(links.length, 'page CSS should be injected from cssSourcePath').to.be.greaterThan(0);
        });
    });

    it('should show empty list message in side panel preview for an empty jnt:contentList', () => {
        // UseEmptyListComponent fires when mode=pages, node has pageAncestors,
        // hasOrderableChildNodes=true, and the list has no previewSubNodes.
        // Structured view is used because list view only shows content items, not structural nodes.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'jcontent-empty-list-test',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'JContent Empty List Test', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'empty-list',
                primaryNodeType: 'jnt:contentList'
            }]
        });
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/jcontent-empty-list-test');
        jcontent.switchToStructuredView();
        jcontent.getTable().getRowByName('empty-list').click();
        sidePanel.switchToTab('tab-preview');

        cy.contains('This list is empty and cannot be previewed').should('be.visible');

        deleteNode(`/sites/${siteKey}/home/jcontent-empty-list-test`);
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
