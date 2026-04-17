import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Content navigation', () => {
    const specialCharsName = '@#$^&€§¢ª¶ø°£™¥‰œæÀ-ž--';

    before(() => {
        createSite('mySite1');
        createSite('mySite2');
        createSite('mySite3', {
            serverName: 'localhost',
            locale: 'en',
            templateSet: 'jcontent-test-template'
        });
        enableModule('jcontent-test-module', 'mySite1');
        enableModule('events', 'mySite1');
        enableModule('press', 'mySite1');
        addNode({parentPathOrId: '/sites/mySite1/contents', primaryNodeType: 'jnt:event', name: 'test-event'});
        addNode({
            name: specialCharsName,
            parentPathOrId: '/sites/mySite1/home',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'special chars page', language: 'en'},
                {name: 'j:templateName', value: '2-column'}
            ]
        });
        addNode({
            name: 'notemplate.my',
            parentPathOrId: '/sites/mySite1/home',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'page with non-template', language: 'en'},
                {name: 'j:templateName', value: '2-column'}
            ]
        });
        addNode({parentPathOrId: '/sites/mySite1/files', name: 'll.js', primaryNodeType: 'jnt:folder'});
        addNode({parentPathOrId: '/sites/mySite1/contents', name: 'll.js', primaryNodeType: 'jnt:contentFolder'});

        enableModule('events', 'mySite3');
        addNode({
            name: 'pagecontent',
            parentPathOrId: '/sites/mySite3/home',
            primaryNodeType: 'jnt:contentList',
            children: [{name: 'crashingView', primaryNodeType: 'pbnt:crashingView'}]
        });
    });

    after(() => {
        deleteSite('mySite1');
        deleteSite('mySite2');
        deleteSite('mySite3');
    });

    beforeEach(() => {
        cy.login();
    });

    it('Should display custom accordion when enabled on site', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        // Tests requireModuleInstalledOnSite prop
        // in /jahia-module/jcontent-test-module/src/main/resources/javascript/apps/accordionConfig.js
        jcontent.getAccordionItem('accordion-config').getHeader().should('be.visible');
    });

    it('Should not display custom accordion when not enabled on site', () => {
        const jcontent = JContent.visit('mySite2', 'en', 'pages/home');
        jcontent.getAccordionItem('accordion-config').shouldNotExist();
    });

    it('can open page with special chars in page builder', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        jcontent.getAccordionItem('pages').expandTreeItem('home');
        jcontent.getAccordionItem('pages').getTreeItem(specialCharsName).click();
        jcontent.shouldBeInMode('Page Builder');
        cy.get('h1').contains('special chars page');
    });

    it('can open media folders with dots', () => {
        JContent.visit('mySite1', 'en', 'media/files/ll.js');
        cy.get('h1').contains('ll.js');
        cy.get('[data-type="upload"]').should('be.visible');
        cy.url().should('contain', 'll.js');
    });

    it('can open content folders with dots', () => {
        JContent.visit('mySite1', 'en', 'content-folders/contents/ll.js');
        cy.get('h1').contains('ll.js');
        cy.get('[data-type="import"]').should('be.visible');
        cy.url().should('contain', 'll.js');
    });

    it('can open page with the correct view mode selection', () => {
        // Highlights content cannot be displayed in page builder view, so list view mode should be activated by default
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/area-main/highlights');
        jcontent.shouldBeInMode('List');
    });

    it('can open event in page builder', () => {
        const jc = JContent.visit('mySite1', 'en', 'content-folders/contents/test-event');
        jc.switchToPageBuilder();
        jc.getAccordionItem('content-folders').getTreeItem('contents').get().invoke('attr', 'aria-current').should('eq', 'page');
        cy.get('.moonstone-chip').find('span').contains('Event').should('be.visible');
        cy.get('h1').contains('test-event');
    });

    it('Display popup when navigating to list and render list view when selected', () => {
        const jc = JContent.visit('mySite1', 'en', 'content-folders/contents/test-event');
        jc.switchToPageBuilder();
        cy.frameLoaded('#page-builder-frame-1');
        jc.getAccordionItem('content-folders').getTreeItem('contents').click();
        cy.get('.moonstone-chip').find('span').contains('Content Folder').should('be.visible');
        cy.get('h1').contains('contents');
    });

    it('shows the default rendered view for errors', () => {
        const siteKey = 'mySite3';
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        cy.frameLoaded('#page-builder-frame-1', {url: `/sites/${siteKey}/home`});
        jcontent.getModule(`/sites/${siteKey}/home/pagecontent/crashingView`).get()
            .should('contain', 'An error occurred during the rendering of the content')
            .and('contain', 'Toggle the full error');
    });

    it('can enter pages and folders with double click', () => {
        const jc = JContent.visit('mySite1', 'en', 'pages/home');
        jc.switchToListMode();

        const row = jc.getTable().getRowByName('search-results');
        row.get().dblclick();
        cy.get('h1').contains('Search Results');

        // Switch to media folders
        jc.getMedia().open();
        const cardRow = jc.getGrid().getCardByName('bootstrap');
        cardRow.get().dblclick();
        cy.get('h1').contains('bootstrap');
    });

    // Template extraction was originally restricted to PageBuilder in https://github.com/Jahia/jcontent/pull/1739
    // It was removed since the issue is no longer reproducible. This test was added to catch any regression.
    it('can navigate to a page with ".something" suffix when ".something" does not match a template', () => {
        const timeout = {timeout: 3000};
        const jc = JContent.visit('mySite1', 'en', 'pages/home/notemplate.my');
        cy.get('h1', timeout).should('contain', 'page with non-template');

        jc.getAccordionItem('pages').getTreeItem('home').click();

        cy.get('h1', timeout).should('contain', 'Home');

        jc.getAccordionItem('pages').getTreeItem('notemplate.my').click();

        cy.get('h1', timeout).should('contain', 'page with non-template');
    });

    // This tests this issue: https://github.com/Jahia/jira-archives/issues/15703
    it('can navigate with a link that contains a template suffix', () => {
        const timeout = {timeout: 10000};
        const jc = JContent.visit('mySite1', 'en', 'pages/home/notemplate.my');
        const pb = jc.switchToPageBuilder();
        const module = pb.getModule('/sites/mySite1/home/notemplate.my/landing', false);
        module.getHeader(false).get().click();
        module.getCreateButtons().getInsertionButtonByIndex(1).click();

        const contentEditor = jc.getCreateContent().getContentTypeSelector().searchForContentType('jnt:press').selectContentType('jnt:press').create();
        contentEditor.getSmallTextField('jnt:press_jcr:title').addNewValue('pressEntry');
        contentEditor.getRichTextField('jnt:press_body').type('random text');
        contentEditor.create();

        cy.wait(5000);
        cy.frameLoaded('[data-sel-role="page-builder-frame-active"]');

        // The link will end like this: ...pressEntry.pressdetail.html so successful navigation confirms that the template part is handled correctly
        cy.waitUntil(() =>
            pb.iframe().get().find('a').contains('pressEntry').then($el => $el.length > 0),
        {interval: 500, ...timeout}
        );
        pb.iframe().get().find('a', timeout).contains('pressEntry', timeout).click();
        cy.get('h1', timeout).should('contain', 'pressEntry');
    });
});
