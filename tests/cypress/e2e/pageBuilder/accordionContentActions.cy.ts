import {JContent} from '../../page-object';
import {ExportDialog} from '../../page-object/exportDialog';
import {addNode, createSite, deleteSite, getComponent} from '@jahia/cypress';

describe('Page builder - accordion context menu actions', () => {
    const siteKey = 'jcontentSite-accordionMenu';
    const navMenuTextName = 'testNavMenuText';
    const pageName = 'testPage';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: navMenuTextName,
            primaryNodeType: 'jnt:navMenuText',
            properties: [{name: 'jcr:title', value: 'Test NavMenuText', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Test Page', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ]
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should offer Export for a navMenuText node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        jcontent.getAccordionItem('pages').getTreeItem('home').expand();
        jcontent.getAccordionItem('pages').getTreeItem(navMenuTextName).contextMenu().selectByRole('export');
        getComponent(ExportDialog).should('be.visible');
    });

    it('should offer Export Page for a page node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        jcontent.getAccordionItem('pages').getTreeItem('home').expand();
        jcontent.getAccordionItem('pages').getTreeItem(pageName).contextMenu().selectByRole('exportPage');
        getComponent(ExportDialog).should('be.visible');
    });
});
