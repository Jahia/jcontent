import {JContent} from '../../page-object';
import {addNode, Button, enableModule, getComponentByRole, Menu} from '@jahia/cypress';

describe('Actions visibility', () => {
    let jcontent: JContent;
    const SITEKEY = 'actionVisibility';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: SITEKEY});
        enableModule('qa-module', 'digitall');
        addNode({
            name: 'my-list',
            parentPathOrId: '/sites/digitall/contents',
            primaryNodeType: 'jnt:contentList'
        });
        addNode({
            name: 'constraintlist3',
            parentPathOrId: '/sites/digitall/contents',
            primaryNodeType: 'qant:constraintList3'
        });
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: SITEKEY});
    });

    it('It verifies that reviewer cannot see creation actions', () => {
        cy.loginAndStoreSession('irina', 'password');
        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');

        // Check new content folder action is not displayed
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContentFolder"]').should('not.exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContent"]').should('not.exist');

        // Check action 'new content' under my-list is not displayed
        const contextMenu = jcontent.openContextMenuByRowName('my-list');
        contextMenu.shouldNotHaveItem('New content');

        // Close contextual menu
        cy.get('.moonstone-menu_overlay').click({force: true});

        // Check actions new constraintChild1... under constraintlist3 are not displayed
        const expectedConstraints = [
            'New constraintChild1',
            'New constraintChild2',
            'New constraintChild3'
        ];
        jcontent.openContextMenuByRowName('constraintlist3');
        expectedConstraints.forEach(constraintType => {
            contextMenu.shouldNotHaveItem(constraintType);
        });
    });

    it('Displays accordionContent actions', () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        const item = jcontent.getAccordionItem('pages').getTreeItem('home');
        const menu = item.contextMenu();
        menu.shouldHaveItem('New Page');
        menu.shouldHaveItem('New');
        menu.shouldHaveItem('Edit');
        menu.shouldHaveItem('Advanced editing');
        menu.shouldHaveItem('Lock');
        menu.shouldHaveItem('Publish');
        menu.shouldHaveItem('Copy');
        menu.shouldHaveItem('Cut');
        menu.shouldHaveItem('Delete');
    });

    it('Displays browserControlBar action', () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        const menu = jcontent.getBrowseControlMenu();
        menu.shouldHaveItem('Advanced editing');
        menu.shouldHaveItem('Lock');
        menu.shouldHaveItem('Delete');
        menu.shouldHaveItem('Clear page cache');
        menu.shouldHaveItem('Clear site cache');
        menu.shouldHaveItem('Export');
        menu.shouldHaveItem('Import content');
        menu.shouldHaveItem('Show in Repository Explorer');
        menu.shouldHaveItem('Open in Page Composer');
    });

    it('Displays contentItemContext actions', () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        jcontent.switchToListMode();
        const menu = jcontent.getTable().getRowByLabel('Search Results').contextMenu();
        menu.shouldHaveItem('Edit');
        menu.shouldHaveItem('Advanced editing');
        menu.shouldHaveItem('Lock');
        menu.shouldHaveItem('Publish');
        menu.shouldHaveItem('Copy');
        menu.shouldHaveItem('Cut');
        menu.shouldHaveItem('Delete');
        menu.shouldHaveItem('Export');
        menu.shouldHaveItem('Import content');
        menu.shouldHaveItem('Show in Repository Explorer');
        menu.shouldHaveItem('Open in Page Composer');
    });

    it('Displays contentItem actions', () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        jcontent.switchToListMode();
        const row = jcontent.getTable().getRowByLabel('Search Results');
        const button = getComponentByRole(Button, 'contentItemActionsMenu', row);
        button.click();
        const menu = getComponentByRole(Menu, 'jcontent-contentItemActionsMenu');
        menu.shouldHaveItem('Edit');
        menu.shouldHaveItem('Advanced editing');
        menu.shouldHaveItem('Lock');
        menu.shouldHaveItem('Publish');
        menu.shouldHaveItem('Copy');
        menu.shouldHaveItem('Cut');
        menu.shouldHaveItem('Delete');
        menu.shouldHaveItem('Export');
        menu.shouldHaveItem('Import content');
        menu.shouldHaveItem('Show in Repository Explorer');
        menu.shouldHaveItem('Open in Page Composer');
    });
});
