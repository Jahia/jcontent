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
    });

    it('Displays accordionContent actions', () => {
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
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        jcontent.switchToListMode();
        const menu = jcontent.getTable().getRowByName('search-results').contextMenu();
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
        jcontent = JContent.visit(SITEKEY, 'en', 'pages/home');
        jcontent.switchToListMode();
        const row = jcontent.getTable().getRowByName('search-results');
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

    it('Checks actions inside contextual menu of a folder', function () {
        jcontent = JContent.visit(SITEKEY, 'en', 'media/files');
        jcontent.switchToListMode();

        const contextMenu = jcontent
            .getTable()
            .getRowByName('bootstrap')
            .contextMenu();

        const items = [
            'Rename',
            'New folder',
            'Copy',
            'Upload file(s)',
            'Lock',
            'Download as zip'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });

    it('Checks actions inside contextual menu of a file', function () {
        jcontent = JContent.visit(SITEKEY, 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();

        const contextMenu = jcontent
            .getTable()
            .getRowByName('bootstrap.css')
            .contextMenu();

        const items = [
            'Edit',
            'Rename',
            'Download',
            'Replace with',
            'Preview',
            'Cut'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });
});
