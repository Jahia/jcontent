import {ContentEditor, JContent, SidePanel} from '../../../page-object';
import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';

describe('JContent preview tests', () => {
    const siteKey = 'jcontentSite';
    const sidePanel = new SidePanel();

    before(() => {
        createSite(siteKey, {
            serverName: 'jahia',
            locale: 'en',
            templateSet: 'jcontent-test-template'
        });
        enableModule('jcontent-test-module', siteKey);
        enableModule('event', siteKey);
        enableModule('bootstrap3-components', siteKey);
        enableModule('article', siteKey);
        enableModule('news', siteKey);

        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});

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
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewMainResource',
            primaryNodeType: 'jnt:news',
            properties: [{name: 'jcr:title', value: 'Preview Main Resource', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewMainResourceWithView',
            primaryNodeType: 'jnt:news',
            mixins: ['jmix:renderable'],
            properties: [
                {name: 'jcr:title', value: 'Preview View Override', language: 'en'},
                // Jmix:renderable is what gives a node j:view. Digitall's person-portrait-1 carries
                // exactly this shape (j:view=event) and it broke the content template render,
                // because under contextConfiguration=page the view argument is the template name.
                // No template node is named 'event', so resolution used to fail and the preview
                // came back empty.
                {name: 'j:view', value: 'event'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'previewInlineScript',
            primaryNodeType: 'cent:previewInlineScript'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'head-attr-test-page',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Head Attr Test Page', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'pagecontent',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'head-attr-news',
                    primaryNodeType: 'jnt:news',
                    properties: [{name: 'jcr:title', value: 'Head Attr News', language: 'en'}]
                }]
            }]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
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

    it('should render content that has a content template through that template', () => {
        // Jnt:news carries jmix:mainResource and the news module ships its own content template
        // for it (j:applyOn=jnt:news, j:defaultTemplate=true), so core resolves a template and
        // displayableNode is the node itself. That template is only applied under
        // contextConfiguration=page - templateNodeFilter runs on wrappedcontent,page,gwt only -
        // which puts the node inside the template set's base template (<div class="bodywrapper">)
        // and makes the render a full document carrying its own CSS.
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.openPreview('previewMainResource');

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.html', 'class="bodywrapper"')
            .and('contain.text', 'Preview Main Resource');
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const links = $iframe[0].contentDocument.head.querySelectorAll('link[rel="stylesheet"]');
            expect(links.length, 'the content template render brings its own CSS').to.be.greaterThan(0);
        });
    });

    it('should still apply the content template when the content carries a j:view', () => {
        // Regression: the view argument means "template name" under contextConfiguration=page, so
        // forwarding the node's j:view made template resolution fail (TemplateNotFoundException)
        // and the pane fell back to "No preview available". A j:view must not change the template
        // that is resolved - core selects that from j:templateName.
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.openPreview('previewMainResourceWithView');

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.html', 'class="bodywrapper"')
            .and('not.contain.text', 'No preview available');
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

    it('should preserve <head> element attributes in hybrid iframe srcDoc', () => {
        // Jcontent-test-template renders <head data-stub="test"> — verifies that extractPageHead
        // captures the full opening tag so attributes are not lost when IframeViewer builds srcDoc.
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/head-attr-test-page');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('head-attr-news').click();
        sidePanel.switchToTab('tab-preview');

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const head = $iframe[0].contentDocument.querySelector('head');
            expect(head, 'iframe should have a head element').to.exist;
            expect(head.getAttribute('data-stub'), '<head data-stub> attribute should be preserved from page template').to.equal('test');
        });
    });

    it('should render content as a static document, without running scripts it contains', () => {
        // The preview shows layout only: the frame renders the markup but must not execute the
        // inline <script> the cent:previewInlineScript view emits. The frame must nonetheless
        // stay readable from the app (same-origin), which the marker assertion below also proves.
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.openPreview('previewInlineScript');

        cy.get('[data-sel-role="preview-container"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.text', 'previewInlineScript marker');

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const doc = $iframe[0].contentDocument;
            expect(doc.querySelector('[data-testid="preview-inline-script-marker"]'),
                'rendered markup should be displayed').to.exist;
            expect(doc.documentElement.dataset.previewScriptRan,
                'inline script in the rendered content should not have run').to.be.undefined;
        });
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
