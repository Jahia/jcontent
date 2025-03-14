import {JContent} from '../../page-object';
import {Button, getComponentByRole, Menu} from '@jahia/cypress';

describe('Actions visibility', () => {
    let jcontent: JContent;
    const SITEKEY = 'actionVisibility';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: SITEKEY});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: SITEKEY});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
    });

    it('Displays accordionContent actions', () => {
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
        menu.shouldHaveItem('Open in Page Composer');
    });

    it('Displays browserControlBar action', () => {
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
