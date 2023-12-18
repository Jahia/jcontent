import {CategoryManager} from '../../page-object';
import {deleteNode} from '@jahia/cypress';

describe('Category Manager', () => {
    let categoryManager: CategoryManager;

    after(() => {
        deleteNode('/sites/systemsite/categories/rootTestCategory');
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('can create and edit a new category', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getSecondaryNav().get().contains('Category Manager').should('be.visible');

        categoryManager.createCategoryNav('categories', {title: 'My Main Category', name: 'rootTestCategory'});
        categoryManager.getTreeItem('rootTestCategory').get().contains('My Main Category');

        categoryManager.editCategoryNav('rootTestCategory', {title: 'Root Test Category'});
        categoryManager.getTreeItem('rootTestCategory').get().contains('Root Test Category');
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

    it('Test copy/cut/paste', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        const accordionItem = categoryManager.getAccordionItem();
        accordionItem.expandTreeItem('rootTestCategory');
        accordionItem.getTreeItem('test-category2').contextMenu().select('Copy');
        accordionItem.getTreeItem('test-category3').contextMenu().select('Paste');

        // Visit and make sure copied category path exists
        categoryManager = CategoryManager.visitCategoryManager('en', 'rootTestCategory/test-category3/test-category2/test-subcategory2');
        categoryManager.getTreeItem('test-subcategory2').should('be.visible');
    });

    it('Contains only expected actions in primary header action', () => {
        categoryManager = CategoryManager.visitCategoryManager('en');
        categoryManager.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('test-category1').should('be.visible');
        const primaryActions = ['New category', 'Edit', 'Import content', 'Refresh'];
        cy.get('.moonstone-header').children('.moonstone-header_toolbar').children('.moonstone-header_actions').find('.moonstone-button').should('have.length', primaryActions.length + 1).and(elems => {
            primaryActions.forEach(action => expect(elems).to.contain(action));
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
        categoryManager.getTable().getRowByLabel('Companies')
            .contextMenu()
            .select('Delete');

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
});
