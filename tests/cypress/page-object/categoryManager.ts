import {ContentEditor} from './contentEditor';
import {SmallTextField} from './fields';
import {JContent} from './jcontent';
import {AccordionItem, TreeItem} from './accordionItem';
import {Button, getComponentByRole} from '@jahia/cypress';

export class CategoryManager extends JContent {
    categoryAccordion: AccordionItem;

    constructor(base: JContent) {
        super();
        Object.assign(this, base);
    }

    static visitCategoryManager(language: string, path = ''): CategoryManager {
        cy.visit(`/jahia/category-manager/${language}/category/${path}`);
        return new CategoryManager(new JContent());
    }

    getCreateCategory(): ContentEditor {
        cy.get('.moonstone-header button[data-sel-role="jnt:category"]').click();
        return new ContentEditor();
    }

    getAccordionItem(): AccordionItem {
        if (!this.categoryAccordion) {
            this.categoryAccordion = super.getAccordionItem('category');
        }

        return this.categoryAccordion;
    }

    getTreeItem(role: string): TreeItem {
        return this.getAccordionItem().getTreeItem(role);
    }

    createCategoryNav(parentName: string, fields: {title?: string, name?: string}) {
        const accordionItem = this.getAccordionItem();
        accordionItem.getTreeItem(parentName).click();
        getComponentByRole(Button, 'jnt:category').click(); // New Category header menu
        this.editFields(fields).create();
    }

    editCategoryNav(name: string, fields: {title?: string, name?: string}, lang?: string) {
        const accordionItem = this.getAccordionItem();
        accordionItem.getTreeItem(name).contextMenu().select('Edit');
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
