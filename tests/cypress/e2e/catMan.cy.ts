import {CategoryManager, JContent} from '../page-object';


const accordionItemName = 'category'
describe('Category Manager', () => {
    let catMan: CategoryManager;

    before(() => {
        cy.apollo({mutationFile: 'jcontent/enableCategoryManager.graphql'});
        cy.apollo({mutationFile: 'jcontent/createCategories.graphql'});
    });

    after(() => {
        cy.apollo({mutationFile: 'jcontent/disableCategoryManager.graphql'});
        cy.logout();
    });

    beforeEach(() => {
        cy.loginEditor();
        cy.apollo({mutationFile: 'jcontent/enableCategoryManager.graphql'});
        catMan = JContent.visitCatMan('en');
    });

    it('Should open Category Manager', () => {
        catMan.getSecondaryNav().get().contains('Category Manager').should('be.visible');
    });

    it('Should disable Category Manager', () => {
        cy.apollo({mutationFile: 'jcontent/disableCategoryManager.graphql'});
        CategoryManager.visitCatMan('en');
        cy.contains('Page not found');
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
        let basicSearch = catMan.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('Test Category').executeSearch().verifyResults(['Root Test Category','Test Category 1','Test Category 2']).verifyTotalCount(3)
    })

    it('Performs a simple search at the specified level', () => {
        const accordionItem = catMan.getAccordionItem(accordionItemName).click();
        accordionItem.getTreeItem('rootTestCategory').click({multiple: true});
        cy.contains('Test Category 1').should('be.visible');
        let basicSearch = catMan.getBasicSearch().openSearch().reset(true);
        basicSearch.searchTerm('Test Category').executeSearch().verifyResults(['Test Category 1','Test Category 2']).verifyTotalCount(2)
    });
});
