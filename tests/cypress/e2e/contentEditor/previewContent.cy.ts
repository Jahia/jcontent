import {PageComposer} from '../../page-object/pageComposer';
import {addNode, deleteNode, enableModule, disableModule} from '@jahia/cypress';
import {ContentEditor, JContent, SidePanel} from '../../page-object';
import {v4 as uuidv4} from 'uuid';

describe('CE Preview tests', () => {
    const siteKey = 'digitall';
    const sidePanel = new SidePanel().inCE();
    const simpleText = 'Simple Text ' + uuidv4();
    const updatedText = 'Updated Text ' + uuidv4();

    before(() => {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'chocolate,-sweets,-cakes',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'chocolate,-sweets,-cakes', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList'
            }]
        });
    });

    after(() => {
        deleteNode(`/sites/${siteKey}/home/chocolate,-sweets,-cakes`);
        deleteNode(`/sites/${siteKey}/contents/simpleText`);
        disableModule('jcontent-test-module', siteKey);
    });

    it('shows PDF preview on content editor', () => {
        cy.login();
        const jcontent = JContent.visit('digitall', 'en', 'media/files/images/pdf');
        jcontent
            .getGrid()
            .getCardByName('Digitall Financial Report.pdf')
            .contextMenu()
            .selectByRole('editAdvanced');
        sidePanel.switchToPreviewTab();
        cy.get('[data-preview-type="pdf"]').should('be.visible');
    });

    it('renders a page as a full page (not a module fragment) in CE preview', () => {
        // When mode=pages and the node IS a page, CE should render it with contextConfiguration=page
        // rather than module — the output is a complete HTML document with a <head> and site chrome.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'ce-full-page-preview-test',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'CE Full Page Preview Test', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ]
        });
        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/ce-full-page-preview-test');
        jcontent.editPage();
        const ce = new ContentEditor();
        ce.switchToAdvancedMode();
        sidePanel.switchToPreviewTab();

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        // Full-page render: StaticAssetsFilter injects CSS directly into <head>
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const links = $iframe[0].contentDocument.head.querySelectorAll('link[rel="stylesheet"]');
            expect(links.length, 'full-page render should have CSS in head via StaticAssetsFilter').to.be.greaterThan(0);
        });

        deleteNode(`/sites/${siteKey}/home/ce-full-page-preview-test`);
    });

    it('injects CSS via cssSourcePath in CE preview for content on a page', () => {
        // In pages mode, buildPreviewContexts sets cssSourcePath = closestPage.path (via
        // buildInContextModuleContext). PreviewFetcher fetches the page HTML and extracts its
        // <head> CSS, which IframeViewer injects into the iframe.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'ce-css-injection-test',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'CE CSS Injection Test', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'cssInjectionPerson',
                    primaryNodeType: 'jnt:person',
                    properties: [{name: 'firstname', value: 'CSS'}, {name: 'lastname', value: 'Injection'}]
                }]
            }]
        });
        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/ce-css-injection-test');
        jcontent.switchToListMode();
        jcontent.editComponentByRowName('cssInjectionPerson');
        const ce = new ContentEditor();
        ce.switchToAdvancedMode();
        sidePanel.switchToPreviewTab();

        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should($iframe => {
            const links = $iframe[0].contentDocument.head.querySelectorAll('link[rel="stylesheet"]');
            expect(links.length, 'page CSS should be injected via cssSourcePath from closest page').to.be.greaterThan(0);
        });

        deleteNode(`/sites/${siteKey}/home/ce-css-injection-test`);
    });

    it('shows empty list message in CE preview for an empty jnt:contentList', () => {
        // UseEmptyListComponent activates when mode=pages, node has pageAncestors,
        // hasOrderableChildNodes=true, and the list has no previewSubNodes.
        // Structured view is used because list view only shows content items, not structural nodes.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'ce-empty-list-test',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'CE Empty List Test', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'empty-list',
                primaryNodeType: 'jnt:contentList'
            }]
        });
        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/ce-empty-list-test');
        jcontent.switchToStructuredView();
        jcontent.editComponentByRowName('empty-list');
        const ce = new ContentEditor();
        ce.switchToAdvancedMode();
        sidePanel.switchToPreviewTab();

        cy.contains('This list is empty and cannot be previewed').should('be.visible');

        deleteNode(`/sites/${siteKey}/home/ce-empty-list-test`);
    });

    it('It updates preview after save', () => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'simpleText',
            primaryNodeType: 'jnt:text'
        });

        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/simpleText');
        const contentEditor = jcontent.editContent();
        contentEditor.switchToAdvancedMode();
        contentEditor.switchToSidePanelPreviewTab();

        cy.log('Check preview badge is not displayed');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('not.exist');

        cy.log('Update content');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue(updatedText);

        cy.log('Check preview badge is displayed');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('exist');

        contentEditor.save();

        cy.log('Check preview badge is not displayed after save');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('not.exist');
        contentEditor.validateContentIsVisibleInPreview(updatedText);
    });

    describe('via PageComposer', {testIsolation: false}, () => {
        let pageComposer: PageComposer;

        it('It shows correctly preview of edited page even if not the one currently rendered in PageComposer', () => {
            cy.loginAndStoreSession();
            pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
            const contentEditor = pageComposer.editPage('Our Companies');
            contentEditor.switchToAdvancedMode();
            contentEditor.validateContentIsVisibleInPreview('Making a Difference');
        });

        it('renders template:include properly', () => {
            addNode({
                parentPathOrId: `/sites/${siteKey}/home/chocolate,-sweets,-cakes/area-main`,
                name: 'previewWrapperIncludesTest',
                primaryNodeType: 'cent:previewWrapper'
            });

            cy.loginAndStoreSession();
            pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
            pageComposer.navigateToPage('chocolate,-sweets,-cakes');
            pageComposer.editComponentByText('previewWrapper');
            const contentEditor = new ContentEditor();
            contentEditor.switchToAdvancedMode();
            // Wait for the preview iframe to be present and finish loading before asserting content
            cy.get('iframe[data-sel-role="edit-preview-frame"]', {timeout: 30000}).should('be.visible');
            cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.have.class', /iframeLoading/);
            contentEditor.validateContentIsVisibleInPreview('previewWrapper Test');
            contentEditor.validateContentIsNotVisibleInPreview('H2');
        });

        it('It shows correctly preview of edited page even if the parent node name have special character', () => {
            addNode({
                parentPathOrId: `/sites/${siteKey}/home/chocolate,-sweets,-cakes/area-main`,
                name: 'text',
                primaryNodeType: 'jnt:text',
                properties: [{language: 'en', name: 'text', type: 'STRING', value: simpleText}]
            });

            cy.loginAndStoreSession();
            pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
            pageComposer.navigateToPage('chocolate,-sweets,-cakes');
            const contentEditor = pageComposer.editComponentByText(simpleText);

            contentEditor.switchToAdvancedMode();

            contentEditor.validateContentIsVisibleInPreview(simpleText);
        });
    });
});

describe('CE in-context preview via pageAncestors (no pageComposer)', () => {
    // Tests CE's in-context rendering path: mode=pages, pageComposer inactive.
    // usePreviewContexts derives closestPage from node.pageAncestors and renders the
    // full hosting page, then zooms to the target component via preview_wrapper.
    const siteKey = 'digitall';
    const testPageName = 'ce-in-context-preview-test-' + uuidv4().slice(0, 8);
    const targetText = 'ce-in-context-target-' + uuidv4().slice(0, 8);
    const siblingText = 'ce-in-context-sibling-' + uuidv4().slice(0, 8);

    before(() => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: testPageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: testPageName, language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [
                    {
                        name: 'target-component',
                        primaryNodeType: 'jnt:bigText',
                        properties: [{name: 'text', language: 'en', value: targetText}]
                    },
                    {
                        name: 'sibling-component',
                        primaryNodeType: 'jnt:bigText',
                        properties: [{name: 'text', language: 'en', value: siblingText}]
                    }
                ]
            }]
        });
    });

    after(() => {
        deleteNode(`/sites/${siteKey}/home/${testPageName}`);
    });

    it('shows zoomed in-context preview when editing a sub-component from pages list view', () => {
        // Open CE from JContent pages list view (no pageComposer) — mode=pages is in Redux state.
        // CE usePreviewContexts picks up pageAncestors → closestPage = parent page.
        // buildPreviewContexts renders the page and uses preview_wrapper to zoom to target-component.
        // After zoom, only targetText should be visible — siblingText must be removed.
        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', `pages/home/${testPageName}`);
        jcontent.switchToListMode();
        jcontent.editComponentByRowName('target-component');
        const ce = new ContentEditor();
        ce.switchToAdvancedMode();

        ce.validateContentIsVisibleInPreview(targetText);
        ce.validateContentIsNotVisibleInPreview(siblingText);
    });
});
