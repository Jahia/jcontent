import {CategoryManager} from '../../page-object';
const accordionItemName = 'category';
describe('Category Manager', () => {
    let catMan: CategoryManager;

    before(() => {
        cy.apollo({mutationFile: 'jcontent/createCategories.graphql'});
    });

    after(() => {
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        catMan = CategoryManager.visitCatMan('en');
    });

    it('Should open Category Manager', () => {
        catMan.getSecondaryNav().get().contains('Category Manager').should('be.visible');
    });

    it('Create a new category', () => {
        catMan.getCreateCategory();
        cy.contains('Create category').should('be.visible');
    });

    it('Navigates to sub category Category 2', () => {
        const accordionItem = catMan.getAccordionItem(accordionItemName);
        accordionItem.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('Test Category 1').should('be.visible');
        accordionItem.expandTreeItem('rootTestCategory');
        accordionItem.expandTreeItem('test-category1');
        accordionItem.getTreeItem('test-category1').click({multiple: true});
        cy.contains('Test Category 2').should('be.visible');
    });

    it('Contains only expected actions in primary header action', () => {
        const accordionItem = catMan.getAccordionItem(accordionItemName);
        accordionItem.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('Test Category 1').should('be.visible');
        const primaryActions = ['New category', 'Edit', 'Import content', 'Refresh'];
        cy.get('.moonstone-header').children('.moonstone-header_toolbar').children('.moonstone-header_actions').find('.moonstone-button').should('have.length', primaryActions.length + 1).and(elems => {
            primaryActions.forEach(action => expect(elems).to.contain(action));
        });
    });

    it('Performs a simple search at the root level', () => {
        const basicSearch = catMan.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('Test Category').executeSearch().verifyResults(['Root Test Category', 'Test Category 1', 'Test Category 2']).verifyTotalCount(3);
    });

    it('Performs a simple search at the specified level', () => {
        const accordionItem = catMan.getAccordionItem(accordionItemName).click();
        accordionItem.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('Test Category 1').should('be.visible');
        const basicSearch = catMan.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('Test Category').executeSearch().verifyResults(['Test Category 1', 'Test Category 2']).verifyTotalCount(2);
    });

    it.only('Shows usages for sub categories when deleting Companies category', () => {
        const accordionItem = catMan.getAccordionItem(accordionItemName);
        accordionItem.getTreeItem('categories').click({multiple: true});
        catMan.getTable().getRowByLabel('Companies')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss).as('deleteDialog');
        cy.get('@deleteDialog').find('[data-cm-role="table-content-list-cell-name"]').children('div').children('svg').click()
        cy.get(dialogCss).should('contain','3 usages').and('contain', '1 usage').and('contain', '2 usages')
        cy.get(dialogCss).contains('3 usages').click()
        cy.get('[data-sel-role="usages-table"]').as('usagesTable').contains('Usages for "Media"')
        const usagesName=['all-Movies', 'all-News', 'all-sports']
        cy.get('@usagesTable').find('[data-cm-role="table-content-list-cell-name"]').should('have.length', 3).and(element => {
            usagesName.forEach(value => expect(element).to.contain(value))
        })
    })
});
