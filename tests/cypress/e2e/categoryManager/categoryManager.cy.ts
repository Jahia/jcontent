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

    it('can create and edit a new category', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getSecondaryNav().get().contains('Categories').should('be.visible');

        categoryManager.createCategoryNav(null, {title: 'My Main Category', name: 'rootTestCategory'});
        categoryManager.getCategory('rootTestCategory').get().contains('My Main Category');

        categoryManager.editCategoryNav('rootTestCategory', {title: 'Root Test Category'});
        categoryManager.editCategoryNav('rootTestCategory', {title: 'Root Test Category - french'}, 'French');
        categoryManager.getCategory('rootTestCategory').get().contains('Root Test Category');

        // The language switcher now lives in the main panel header
        categoryManager.getLanguageSwitcher().select('French');
        categoryManager.getCategory('rootTestCategory').get().contains('Root Test Category - french');
    });

    it('create subcategories and navigate to it', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category1'});
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category2'});
        categoryManager.createCategoryNav('rootTestCategory', {title: 'test-category3'});

        categoryManager.expandCategory('rootTestCategory');
        categoryManager.getCategory('test-category1').get().should('be.visible');
        categoryManager.getCategory('test-category2').get().should('be.visible');
        categoryManager.getCategory('test-category3').get().should('be.visible');

        categoryManager.createCategoryNav('test-category1', {title: 'test-subcategory1'});
        categoryManager.createCategoryNav('test-category2', {title: 'test-subcategory2'});
        categoryManager.createCategoryNav('test-category3', {title: 'test-subcategory3'});

        categoryManager.expandCategory('test-category1');
        cy.contains('test-subcategory1').should('be.visible');
        categoryManager.expandCategory('test-category2');
        cy.contains('test-subcategory2').should('be.visible');
        categoryManager.expandCategory('test-category3');
        cy.contains('test-subcategory3').should('be.visible');
    });

    it('Test copy/paste', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.expandCategory('rootTestCategory');
        categoryManager.getCategory('test-category2').contextMenu().select('Copy');
        categoryManager.getCategory('test-category3').contextMenu().select('Paste');

        // The copy shows up under test-category3, alongside the original
        categoryManager.expandCategory('test-category3');
        categoryManager.getCategories('test-category2').should('have.length', 2);
    });

    it('Contains only expected actions in primary header action', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.selectCategory('rootTestCategory');
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
        categoryManager.selectCategory('companies');
        categoryManager.getBrowseControlMenu().selectByRole('export');
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
        categoryManager.selectCategory('import-zip');
        categoryManager.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile(path.join(downloadsFolder, 'companies.zip'), {force: true});
        categoryManager.isExpandable('import-zip');
        categoryManager.expandCategory('import-zip');
        categoryManager.getCategories('companies').should('have.length', 2);
    });

    it('can import/export categories - xml', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const downloadsFolder = Cypress.config('downloadsFolder');

        // Export xml
        categoryManager.selectCategory('companies');
        categoryManager.getBrowseControlMenu().selectByRole('export');
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
        categoryManager.selectCategory('import-xml');
        categoryManager.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile({
            contents: path.join(downloadsFolder, 'companies.xml'),
            mimeType: 'text/xml' // Need to override default mimeType application/xml
        }, {force: true});

        categoryManager.isExpandable('import-xml');
        categoryManager.expandCategory('import-xml');
        categoryManager.getCategories('companies').should('have.length', 2);
    });
});
