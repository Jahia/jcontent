import {CategoryManager} from '../../page-object';
import {BaseComponent, Button, deleteNode, Dropdown, getComponentByAttr} from '@jahia/cypress';
import * as path from 'path';

describe('Category Manager', {defaultCommandTimeout: 10000}, () => {
    let categoryManager: CategoryManager;

    before(() => {
        cy.apollo({mutationFile: 'jcontent/createCategories.graphql'});
    });

    after(() => {
        deleteNode('/sites/systemsite/categories/rootTestCategory');
        deleteNode('/sites/systemsite/categories/import-xml');
        deleteNode('/sites/systemsite/categories/import-zip');
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    // Root categories has depth=0
    function categoryExists(role: string, depth: number) {
        // Workaround to get tree item for a given depth;
        // the actual style text depends on chrome version
        // - v107 has "--tree-depth:2" while v120 has "--tree-depth: 2" (with space)
        // account for both scenarios (to be fixed in moonstone)
        cy.get(`[data-sel-role="${role}"][style*="depth: ${depth}"],[data-sel-role="${role}"][style*="depth:${depth}"]`)
            .should('be.visible');
    }

    it('can create and edit a new category', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getSecondaryNav().get().contains('Category Manager').should('be.visible');

        categoryManager.createCategoryNav('categories', {title: 'My Main Category', name: 'rootTestCategory'});
        categoryManager.getTreeItem('rootTestCategory').get().contains('My Main Category');

        categoryManager.editCategoryNav('rootTestCategory', {title: 'Root Test Category'});
        categoryManager.editCategoryNav('rootTestCategory', {title: 'Root Test Category - french'}, 'French');
        categoryManager.getTreeItem('rootTestCategory').get().contains('Root Test Category');

        categoryManager.getLanguageSwitcher().select('French');
        categoryManager.getTreeItem('rootTestCategory').get().contains('Root Test Category - french');
    });

    it('create subcategories and navigate to it', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category1'});
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category2'});
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category3'});

        const accordionItem = categoryManager.getAccordionItem();
        accordionItem.expandTreeItem('rootTestCategory');
        accordionItem.getTreeItem('test-category1').get().should('be.visible');
        accordionItem.getTreeItem('test-category2').get().should('be.visible');
        accordionItem.getTreeItem('test-category3').get().should('be.visible');

        categoryManager.createCategoryNav('test-category1', {title: 'test-subcategory1'});
        categoryManager.createCategoryNav('test-category2', {title: 'test-subcategory2'});
        categoryManager.createCategoryNav('test-category3', {title: 'test-subcategory3'});

        accordionItem.expandTreeItem('test-category1');
        cy.contains('test-subcategory1').should('be.visible');
        accordionItem.expandTreeItem('test-category2');
        cy.contains('test-subcategory2').should('be.visible');
        accordionItem.expandTreeItem('test-category3');
        cy.contains('test-subcategory3').should('be.visible');
    });

    it('Test copy/paste', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const accordionItem = categoryManager.getAccordionItem();
        accordionItem.expandTreeItem('rootTestCategory');
        accordionItem.getTreeItem('test-category2').contextMenu().select('Copy');
        accordionItem.getTreeItem('test-category3').contextMenu().select('Paste');

        // Get the category pasted under test-category3
        accordionItem.expandTreeItem('test-category3');
        categoryExists('test-category2', 2);
    });

    it('Contains only expected actions in primary header action', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('test-category1').should('be.visible');
        const primaryActions = ['New category', 'Edit', 'Refresh'];
        cy.get('.moonstone-header').children('.moonstone-header_toolbar').children('.moonstone-header_actions')
            .find('.moonstone-button')
            .should('have.length', primaryActions.length + 1) // +1 for 3-menu button
            .and(elems => {
                primaryActions.forEach(action => expect(elems).to.contain(action));
            });

        categoryManager.getTable().selectRowByLabel('test-category1');
        const selectedPrimaryActions = ['Clear selection', 'Export', 'Copy', 'Cut', 'Delete (permanently)'];
        cy.get('.moonstone-header').children('.moonstone-header_toolbar').children('.moonstone-header_actions')
            .find('.moonstone-button')
            .should('have.length', selectedPrimaryActions.length)
            .and(elems => {
                selectedPrimaryActions.forEach(action => expect(elems).to.contain(action));
            });
    });

    it('Performs a simple search at the root level', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const basicSearch = categoryManager.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('subcategory').executeSearch()
            .verifyResults(['test-subcategory1', 'test-subcategory2', 'test-subcategory2', 'test-subcategory3'])
            .verifyTotalCount(4);
    });

    it('Performs a simple search at the specified level', () => {
        categoryManager = CategoryManager.visitCategoryManager('en', 'rootTestCategory/test-category3');
        cy.contains('test-category3').should('be.visible');
        const basicSearch = categoryManager.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('subcategory').executeSearch()
            .verifyResults(['test-subcategory2', 'test-subcategory3'])
            .verifyTotalCount(2);
    });

    it('Shows usages for sub categories when deleting Companies category', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getAccordionItem().getTreeItem('categories').click({multiple: true});
        categoryManager.getTable().getRowByLabel('Companies').contextMenu().select('Delete');

        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss).as('deleteDialog');
        cy.get('@deleteDialog').find('[data-cm-role="table-content-list-cell-name"]').children('div').children('svg').click();
        cy.get(dialogCss).should('contain', '3 usages').and('contain', '1 usage').and('contain', '2 usages');
        cy.get(dialogCss).contains('3 usages').click();
        cy.get('[data-sel-role="usages-table"]').as('usagesTable').contains('Usages for "Media"');
        const usagesName = ['all-Movies', 'all-News', 'all-sports'];
        cy.get('@usagesTable').find('[data-cm-role="table-content-list-cell-name"]').should('have.length', 3).and(element => {
            usagesName.forEach(value => expect(element).to.contain(value));
        });
    });

    it('can import/export categories - zip', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const downloadsFolder = Cypress.config('downloadsFolder');
        cy.exec(`mkdir -p ${downloadsFolder}`, {failOnNonZeroExit: false});

        // Export zip
        categoryManager.getTreeItem('companies').contextMenu().select('Export');
        const dialog = getComponentByAttr(BaseComponent, 'data-cm-role', 'export-options');
        dialog.should('be.visible');
        getComponentByAttr(Dropdown, 'data-cm-role', 'select-workspace', dialog).select('Staging and live content');
        dialog.get().find('[data-cm-role="export-as-xml"] input[type="checkbox"]').should('be.disabled');
        getComponentByAttr(Button, 'data-cm-role', 'export-button').click();
        dialog.should('not.exist');

        cy.waitUntil(() => cy.exec(`ls ${downloadsFolder}`).then(result => {
            console.log(result.stdout);
            return result.stdout.includes('companies.zip');
        }), {timeout: 30000, interval: 1000, errorMsg: 'Unable to download companies.zip'});

        // Import zip
        categoryManager.getTreeItem('import-zip').contextMenu().select('Import content');
        cy.get('#file-upload-input').selectFile(path.join(downloadsFolder, 'companies.zip'), {force: true});
        categoryManager.getTreeItem('import-zip').get()
            .find('.moonstone-treeView_itemToggle svg').should('be.visible');
        categoryManager.getTreeItem('import-zip').expand();
        categoryExists('companies', 1);
    });

    it('can import/export categories - xml', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const downloadsFolder = Cypress.config('downloadsFolder');

        // Export xml
        categoryManager.getTreeItem('companies').contextMenu().select('Export');
        const dialog = getComponentByAttr(BaseComponent, 'data-cm-role', 'export-options');
        dialog.should('be.visible');
        getComponentByAttr(Dropdown, 'data-cm-role', 'select-workspace', dialog).select('Staging content only');
        dialog.get().find('[data-cm-role="export-as-xml"] input[type="checkbox"]').should('not.be.disabled').check();
        getComponentByAttr(Button, 'data-cm-role', 'export-button').click();
        dialog.should('not.exist');

        cy.waitUntil(() => cy.exec(`ls ${downloadsFolder}`).then(result => {
            console.log(result.stdout);
            return result.stdout.includes('companies.xml');
        }), {timeout: 30000, interval: 1000, errorMsg: 'Unable to download companies.xml'});

        // Import xml
        categoryManager.getTreeItem('import-xml').contextMenu().select('Import content');
        cy.get('#file-upload-input').selectFile({
            contents: path.join(downloadsFolder, 'companies.xml'),
            mimeType: 'text/xml' // Need to override default mimeType application/xml
        }, {force: true});

        categoryManager.getTreeItem('import-xml').get()
            .find('.moonstone-treeView_itemToggle svg').should('be.visible');
        categoryManager.getTreeItem('import-xml').expand();
        categoryExists('companies', 1);
        categoryManager.getTreeItem('import-xml').collapse();
    });
});
