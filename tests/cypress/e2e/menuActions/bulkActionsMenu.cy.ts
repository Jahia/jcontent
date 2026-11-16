import {addNode, Button, createSite, deleteSite, enableModule, getComponentBySelector, Menu} from '@jahia/cypress';
import {JContent} from '../../page-object';

describe('Bulk actions menu', () => {
    const siteKey = 'bulkMenuSite';
    const otherSiteKey = 'bulkMenuNoActionSite';
    const searchTerm = 'bulkmenuterm';
    const texts = ['bulk-text-1', 'bulk-text-2', 'bulk-text-3'];
    const bulkButton = '.moonstone-header button[data-sel-role="bulkActionsMenu"]';

    const createContent = (site: string) => {
        texts.forEach(name => addNode({
            parentPathOrId: `/sites/${site}/contents`,
            name,
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: `<p>${searchTerm} ${name}</p>`, language: 'en'}]
        }));
        addNode({
            parentPathOrId: `/sites/${site}/contents`,
            name: 'bulk-folder',
            primaryNodeType: 'jnt:contentFolder'
        });
    };

    const openBulkMenu = (): Menu => {
        cy.get('.moonstone-loader').should('not.exist');
        getComponentBySelector(Button, bulkButton).click();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    };

    before(() => {
        [siteKey, otherSiteKey].forEach(site => {
            createSite(site, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
            createContent(site);
        });
        enableModule('jcontent-test-module', siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        deleteSite(otherSiteKey);
        cy.logout();
    });

    it('shows the menu when one item is selected in list view', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        cy.get(bulkButton).should('not.exist');

        jcontent.getTable().selectRowByName('bulk-text-1');
        openBulkMenu().shouldHaveItem('Test bulk action');
        cy.get('li[data-sel-role="testBulkAction"]').click();
        cy.window().its('jcontentTestBulkActionPaths').should('deep.equal', [`/sites/${siteKey}/contents/bulk-text-1`]);
    });

    it('hands several selected items to the bulk action in structured view', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToStructuredView();
        texts.forEach(name => jcontent.getTable().selectRowByName(name));
        jcontent.checkSelectionCount(3);

        openBulkMenu();
        cy.get('li[data-sel-role="testBulkAction"]').click();
        cy.window().its('jcontentTestBulkActionPaths').should('have.length', 3);
    });

    it('shows the menu for selected search results', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('bulk-text-1');
        jcontent.getBasicSearch().openSearch().searchTerm(searchTerm).executeSearch();
        jcontent.getTable().selectRowByName('bulk-text-1');
        jcontent.getTable().selectRowByName('bulk-text-2');

        openBulkMenu().shouldHaveItem('Test bulk action');
    });

    it('hides the menu when no bulk action applies to the selection', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        jcontent.getTable().selectRowByName('bulk-folder');
        jcontent.checkSelectionCount(1);

        cy.get(bulkButton).should('not.exist');
        jcontent.checkSelectionCount(1);
    });

    it('hides the menu when no bulk action is available on the site', () => {
        const jcontent = JContent.visit(otherSiteKey, 'en', 'content-folders/contents').switchToListMode();
        jcontent.getTable().selectRowByName('bulk-text-1');
        jcontent.checkSelectionCount(1);

        cy.get(bulkButton).should('not.exist');
        jcontent.checkSelectionCount(1);
    });
});
