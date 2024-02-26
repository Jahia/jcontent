import {ContentEditor, JContent} from '../../page-object';
import {preparePerformanceTool, generateReportFile, gatherPerformanceStats} from '../../support/performanceTool';
import {Button, getComponentByRole} from '@jahia/cypress';

describe('jContent performance tests', () => {
    let jcontent: JContent;
    const siteKey = 'jcontentSitePerformance';
    const repeatTimes = 3;

    before(() => {
        // These timeout values were sufficient for my machine, they are most likely machine dependent
        Cypress.config('execTimeout', 1000000);
        Cypress.config('defaultCommandTimeout', 1000000);
        Cypress.config('requestTimeout', 1000000);
        Cypress.config('responseTimeout', 1000000);
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.executeGroovy('performance/generatedata.groovy', {SITEKEY: siteKey});
        preparePerformanceTool();
    });

    after(() => {
        generateReportFile();
        cy.logout();
        // Cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    });

    Cypress._.times(repeatTimes, () => {
        it('Test navigation tree expansion', () => {
            gatherPerformanceStats(cy);
            const pageAccordion = jcontent.getAccordionItem('pages');
            pageAccordion.getTreeItem('home').expand();
            pageAccordion.getTreeItem('page-2-1').expand();
            pageAccordion.getTreeItem('page-2-2').expand();
            pageAccordion.getTreeItem('page-2-3').expand();
            pageAccordion.getTreeItem('page-2-4').expand();
            pageAccordion.getTreeItem('page-2-5').should('exist');
            pageAccordion.getTreeItem('page-2-1').collapse();
        });
    });

    Cypress._.times(repeatTimes, () => {
        it('Test navigation tree expansion and context menu', () => {
            gatherPerformanceStats(cy);
            const pageAccordion = jcontent.getAccordionItem('pages');
            let item = pageAccordion.getTreeItem('home');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-3-1');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-3-2');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-3-3');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-3-4');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-3-5');
            item.contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            pageAccordion.getTreeItem('page-3-1').collapse();
        });
    });

    Cypress._.times(repeatTimes, () => {
        it('Test navigation tree expansion, context menu and open editor', () => {
            gatherPerformanceStats(cy);
            const pageAccordion = jcontent.getAccordionItem('pages');
            let item = pageAccordion.getTreeItem('home');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            item.expand();
            item = pageAccordion.getTreeItem('page-4-1');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            item.expand();
            item = pageAccordion.getTreeItem('page-4-2');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            item.expand();
            item = pageAccordion.getTreeItem('page-4-3');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            item.expand();
            item = pageAccordion.getTreeItem('page-4-4');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            item.expand();
            item = pageAccordion.getTreeItem('page-4-5');
            item.contextMenu().select('Edit');
            ContentEditor.getContentEditor().cancel();
            pageAccordion.getTreeItem('page-4-1').collapse();
        });
    });

    Cypress._.times(repeatTimes, () => {
        it('Test navigation tree expansion, page selection with context menu', () => {
            gatherPerformanceStats(cy);
            jcontent.switchToStructuredView();
            const pageAccordion = jcontent.getAccordionItem('pages');
            let item = pageAccordion.getTreeItem('home');
            item.expand();
            item = pageAccordion.getTreeItem('page-4-1');
            item.click();
            jcontent.getTable().getRowByLabel('highlights-1').contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-4-2');
            item.click();
            jcontent.getTable().getRowByLabel('highlights-1').contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-4-3');
            item.click();
            jcontent.getTable().getRowByLabel('highlights-1').contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-4-4');
            item.click();
            jcontent.getTable().getRowByLabel('highlights-1').contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            item.expand();
            item = pageAccordion.getTreeItem('page-4-5');
            item.click();
            jcontent.getTable().getRowByLabel('highlights-1').contextMenu().shouldHaveItem('Delete');
            cy.get('.moonstone-menu_overlay').click({force: true});
            pageAccordion.getTreeItem('page-4-1').collapse();
        });
    });

    Cypress._.times(repeatTimes, () => {
        it('Test navigation tree expansion, context menu and deletion', () => {
            gatherPerformanceStats(cy);
            const pageAccordion = jcontent.getAccordionItem('pages');
            let item = pageAccordion.getTreeItem('home');
            item.expand();
            item = pageAccordion.getTreeItem('page-1-1');
            item.contextMenu().select('Delete');
            getComponentByRole(Button, 'delete-mark-button').should('be.visible');
            getComponentByRole(Button, 'cancel-button').click();
            item.expand();
            item = pageAccordion.getTreeItem('page-1-2');
            item.contextMenu().select('Delete');
            getComponentByRole(Button, 'delete-mark-button').should('be.visible');
            getComponentByRole(Button, 'cancel-button').click();
            item.expand();
            item = pageAccordion.getTreeItem('page-1-3');
            item.contextMenu().select('Delete');
            getComponentByRole(Button, 'delete-mark-button').should('be.visible');
            getComponentByRole(Button, 'cancel-button').click();
            item.expand();
            item = pageAccordion.getTreeItem('page-1-4');
            item.contextMenu().select('Delete');
            getComponentByRole(Button, 'delete-mark-button').should('be.visible');
            getComponentByRole(Button, 'cancel-button').click();
            item.expand();
            item = pageAccordion.getTreeItem('page-1-5');
            item.contextMenu().select('Delete');
            getComponentByRole(Button, 'delete-mark-button').should('be.visible');
            getComponentByRole(Button, 'cancel-button').click();
            pageAccordion.getTreeItem('page-1-1').collapse();
        });
    });

    it('Empty test, helps make sure test:after:run executes fully for the previous batch', () => {
        assert(true);
    });
});
