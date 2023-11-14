import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Content navigation', () => {
    before(() => {
        createSite('mySite1');
        createSite('mySite2');
        enableModule('jcontent-test-module', 'mySite1');
        enableModule('events', 'mySite1');
        addNode({parentPathOrId: '/sites/mySite1/contents', primaryNodeType: 'jnt:event', name: 'test-event'});
    });

    after(() => {
        deleteSite('mySite1');
        deleteSite('mySite2');
    });

    beforeEach(() => {
        cy.login();
    });

    it('Should display custom accordion when enabled on site', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        // Tests/jahia-module/jcontent-test-module/src/main/resources/javascript/apps/accordionConfig.js
        jcontent.getAccordionItem('accordion-config').getHeader().should('be.visible');
    });

    it('Should not display custom accordion when not enabled on site', () => {
        const jcontent = JContent.visit('mySite2', 'en', 'pages/home');
        jcontent.getAccordionItem('accordion-config').shouldNotExist();
    });

    it('can open news in page builder', () => {
        const jc = JContent.visit('mySite1', 'en', 'content-folders/contents');
        jc.getTable().getRowByLabel('test-event').contextMenu().select('Open in Page Builder');
        cy.frameLoaded('#page-builder-frame-1');
        jc.shouldBeInMode('Page Builder');
        jc.getAccordionItem('content-folders').getTreeItem('contents').get().invoke('attr', 'data-highlight').should('eq', 'true');
        cy.get('.moonstone-chip').find('span').contains('Event').should('be.visible');
        cy.get('h1').contains('test-event');
    });

    it('Display popup when navigating to list and render list view when selected', () => {
        const jc = JContent.visit('mySite1', 'en', 'content-folders/contents/test-event');
        jc.switchToPageBuilder();
        cy.frameLoaded('#page-builder-frame-1');
        jc.getAccordionItem('content-folders').getTreeItem('contents').click();
        cy.get('button[data-sel-role="view-list"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Content Folder').should('be.visible');
        cy.get('h1').contains('contents');
    });
});
