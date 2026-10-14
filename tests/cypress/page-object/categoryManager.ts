import {ContentEditor} from './contentEditor';
import {SmallTextField} from './fields';
import {JContent} from './jcontent';
import {ContentTableRow} from './contentTable';
import {Button, getComponentByRole} from '@jahia/cypress';
import Chainable = Cypress.Chainable;

// Name cell of a row, and the wrapper that carries the expand chevron when the row has children
const NAME_CELL = '[data-cm-role^="table-content-list-cell-name"]';
const EXPANDER = `${NAME_CELL} .moonstone-TableCell > svg`;
const LABEL = `${NAME_CELL} span[class*="moonstone-tableCellContent"]`;

/**
 * Categories are managed from a single place: the whole tree is rendered as an expandable
 * table in the main panel, the secondary navigation only holds the "Categories" entry point.
 */
export class CategoryManager extends JContent {
    constructor(base: JContent) {
        super();
        Object.assign(this, base);
    }

    static visitCategoryManager(language: string, path = ''): CategoryManager {
        cy.visit(`/jahia/taxonomy/categories/${language}/category/${path}`);
        return new CategoryManager(new JContent());
    }

    getCreateCategory(): ContentEditor {
        cy.get('.moonstone-header button[data-sel-role="jnt:category"]').click();
        return new ContentEditor();
    }

    getCategory(name: string): ContentTableRow {
        return this.getTable().getRowByName(name);
    }

    /**
     * All rows carrying that node name, to tell apart categories duplicated across branches
     */
    getCategories(name: string): Chainable {
        return cy.get(`[data-cm-role="table-content-list-row"][data-node-name="${name}"]`);
    }

    /**
     * Makes a category the current one, so the header actions apply to it
     */
    selectCategory(name: string): CategoryManager {
        this.getCategory(name).get().find(LABEL).dblclick();
        cy.get('.moonstone-loader', {timeout: 10000}).should('not.exist');
        return this;
    }

    expandCategory(name: string): CategoryManager {
        this.getCategory(name).get().find(EXPANDER).first().click();
        return this;
    }

    isExpandable(name: string): CategoryManager {
        this.getCategory(name).get().find(EXPANDER).should('be.visible');
        return this;
    }

    /**
     * @param parentName category to create under, null to create at the root of the tree
     */
    createCategoryNav(parentName: string | null, fields: {title: string, name?: string}) {
        if (parentName) {
            this.selectCategory(parentName);
        }

        cy.get('.moonstone-loader', {timeout: 10000}).should('not.exist');
        getComponentByRole(Button, 'jnt:category').click(); // New Category header menu
        this.editFields(fields).create();
        this.getTable().getRowByName(fields.name || fields.title).should('be.visible');
    }

    editCategoryNav(name: string, fields: {title?: string, name?: string}, lang?: string) {
        this.getCategory(name).contextMenu().select('Edit');
        this.editFields(fields, lang).save();
    }

    editFields({title, name}: {title?: string, name?: string}, lang?: string) {
        const contentEditor = new ContentEditor();
        if (lang) {
            contentEditor.getLanguageSwitcher().selectLang(lang);
        }

        if (title) {
            const titleField = contentEditor.getField(SmallTextField, 'jnt:category_jcr:title', false);
            titleField.addNewValue(title);
        }

        if (name) {
            const systemNameField = contentEditor.getField(SmallTextField, 'nt:base_ce:systemName', false);
            systemNameField.addNewValue(name);
        }

        return contentEditor;
    }

    editItem(text: string): ContentEditor {
        cy.get(`span[class*="moonstone-tableCellContent"]:contains("${text}")`).rightclick();
        cy.get('li[data-registry-key="action:edit"]').click();
        return new ContentEditor();
    }
}
