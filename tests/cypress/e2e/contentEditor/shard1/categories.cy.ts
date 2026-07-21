import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';
import {CategoryManager, JContent} from '../../../page-object';

const siteKey = 'categoriesSite';
const categoriesPath = '/sites/systemsite/categories';
const contentsPath = `/sites/${siteKey}/contents`;

describe('Categories tests', () => {
    let jcontent: JContent;

    before('Setup site, content and categories', () => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('qa-module', siteKey);

        addNode({
            parentPathOrId: categoriesPath,
            name: 'catone',
            primaryNodeType: 'jnt:category',
            properties: [{name: 'jcr:title', language: 'en', value: 'catone'}]
        });
        addNode({
            parentPathOrId: categoriesPath,
            name: 'cattwo',
            primaryNodeType: 'jnt:category',
            properties: [{name: 'jcr:title', language: 'en', value: 'cattwo'}]
        });
        addNode({
            parentPathOrId: categoriesPath,
            name: 'catthree',
            primaryNodeType: 'jnt:category',
            properties: [{name: 'jcr:title', language: 'en', value: 'catthree'}]
        });

        addNode({
            parentPathOrId: categoriesPath,
            name: 'cat-special',
            primaryNodeType: 'jnt:category',
            properties: [{name: 'jcr:title', language: 'en', value: 'cat éàü & spécial'}]
        });

        addNode({
            parentPathOrId: contentsPath,
            name: 'testSimpleText',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'TextForCategories'}]
        });

        addNode({
            parentPathOrId: contentsPath,
            name: 'testEmployee',
            primaryNodeType: 'qant:employee',
            properties: [{name: 'jcr:title', language: 'en', value: 'Jane Doe'}]
        });
    });

    after('Cleanup', () => {
        deleteSite(siteKey);
        deleteNode(`${categoriesPath}/catone`);
        deleteNode(`${categoriesPath}/cattwo`);
        deleteNode(`${categoriesPath}/catthree`);
        deleteNode(`${categoriesPath}/cat-special`);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('category only displays Content section in edit', () => {
        const categoryManager = new CategoryManager(new JContent());
        CategoryManager.visitCategoryManager('en');
        categoryManager.editItem('catone');

        const sectionAttr = 'data-sel-content-editor-fields-group';
        cy.get(`[${sectionAttr}]`)
            .should('have.length', 1)
            .and('have.attr', sectionAttr, 'content');
    });

    it('displays limited advanced options', () => {
        const categoryManager = new CategoryManager(new JContent());
        CategoryManager.visitCategoryManager('en');
        const contentEditor = categoryManager.editItem('catthree');
        contentEditor.switchToAdvancedMode();
        cy.get('[data-sel-role="sel-view-mode-dropdown"][data-sel-tab]').click();
        cy.get('[data-option-type="group"]').contains('Advanced options').should('be.visible');

        // A category exposes a limited set: only the role tabs, no workflow/versioning
        cy.get('[data-sel-role="tab-editroles"]').should('be.visible');
        cy.get('[data-sel-role="tab-liveroles"]').should('be.visible');
        cy.get('[data-sel-role="tab-workflow"]').should('not.exist');
        cy.get('[data-sel-role="tab-versioning"]').should('not.exist');
    });

    it('can add several categories', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('testSimpleText');
        contentEditor.openSection('metadata');
        contentEditor.toggleOption('jmix:categorized', 'Categories');

        const categoryField = contentEditor.getChoiceTreeField('jmix:categorized_j:defaultCategory', true);
        const choiceTree = categoryField.openTree();

        choiceTree.selectEntry('catone');
        choiceTree.selectEntry('cattwo');
        choiceTree.selectEntry('catthree');
        categoryField.closeTree();

        categoryField.getValues().should('have.length', 3);
        categoryField.getValues().should('contain', 'catone');
        categoryField.getValues().should('contain', 'cattwo');
        categoryField.getValues().should('contain', 'catthree');

        contentEditor.save();
    });

    it('can remove categories', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('testSimpleText');
        contentEditor.openSection('metadata');

        const categoryField = contentEditor.getChoiceTreeField('jmix:categorized_j:defaultCategory', true);
        categoryField.getValues().should('have.length', 3);

        categoryField.removeValue('cattwo');
        categoryField.getValues().should('have.length', 2);
        categoryField.getValues().should('not.contain', 'cattwo');
        categoryField.getValues().should('contain', 'catone');
        categoryField.getValues().should('contain', 'catthree');

        contentEditor.save();
    });

    it('can search for a category and add it', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('testSimpleText');
        contentEditor.openSection('metadata');

        const categoryField = contentEditor.getChoiceTreeField('jmix:categorized_j:defaultCategory', true);
        const choiceTree = categoryField.openTree();

        // Type in the search/filter input to find cattwo
        cy.get('[data-sel-role="choice-tree"] menu').find('input').type('cattwo');
        choiceTree.getEntries().should('contain', 'cattwo');
        choiceTree.selectEntry('cattwo');
        categoryField.closeTree();

        categoryField.getValues().should('contain', 'cattwo');

        contentEditor.save();
    });

    it('can list categories and select one', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('testEmployee');
        cy.get('[name="qant:employee_listCategories"] [role="listbox"]').click();

        // Verify all categories are listed in the dropdown menu
        const expectedCategories = ['catone', 'cattwo', 'catthree', 'cat éàü & spécial'];
        expectedCategories.forEach(cat => {
            cy.get('[name="qant:employee_listCategories"] menu [role="option"]').should('contain', cat);
        });

        // Select a category
        cy.get('[name="qant:employee_listCategories"] menu [role="option"]').contains('catone').click();
        cy.get('[name="qant:employee_listCategories"] [role="listbox"]').should('contain', 'catone');

        contentEditor.save();
    });

    it('should add a category with special characters', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('testSimpleText');
        contentEditor.openSection('metadata');

        const categoryField = contentEditor.getChoiceTreeField('jmix:categorized_j:defaultCategory', true);
        const choiceTree = categoryField.openTree();
        choiceTree.selectEntry('cat éàü & spécial');
        categoryField.closeTree();
        categoryField.getValues().should('contain', 'cat éàü & spécial');
        contentEditor.save();
        cy.get('[role="alertdialog"]', {timeout: 5000}).should('not.exist');

        // Re-open and verify the category was persisted
        const editorReopen = jcontent.editComponentByRowName('testSimpleText');
        editorReopen.openSection('metadata');

        const categoryFieldReopen = editorReopen.getChoiceTreeField('jmix:categorized_j:defaultCategory', true);
        categoryFieldReopen.getValues().should('contain', 'cat éàü & spécial');
        editorReopen.cancel();
    });
});
