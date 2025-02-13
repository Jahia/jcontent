import {JContent} from '../../page-object';
import {addNode, Button, createSite, deleteSite, enableModule, getComponentByRole} from '@jahia/cypress';

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
        enableModule('events', 'mySite3');
        addNode({parentPathOrId: '/sites/mySite1/contents', primaryNodeType: 'jnt:event', name: 'test-event'});
        addNode({parentPathOrId: '/sites/mySite3/contents', primaryNodeType: 'jnt:event', name: 'test-event'});
        addNode({
            name: specialCharsName,
            parentPathOrId: '/sites/mySite1/home',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'special chars page', language: 'en'},
                {name: 'j:templateName', value: '2-column'}
            ]
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
        jcontent.shouldBeInMode('Page Builder - Beta');
        cy.get('h1').contains('special chars page');
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

    it('Display popup when viewing content that does not have valid template', () => {
        const jc = JContent.visit('mySite3', 'en', 'content-folders/contents/test-event');
        jc.switchToPageBuilder();
        cy.get('[data-sel-role="node-content-dialog"]')
            .should('be.visible')
            .find('#form-dialog-title')
            .contains('Page Builder view not available')
            .should('be.visible');
        getComponentByRole(Button, 'view-list').click();
        jc.shouldBeInMode('List');
    });
});
