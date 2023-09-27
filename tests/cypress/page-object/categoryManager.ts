import {ContentEditor} from './contentEditor';

export class CategoryManager {
    static open() {
        cy.get('[role="category-manager-menu-item"]').click();
        return new CategoryManager();
    }

    editItem(text: string) {
        cy.get(`span[class*="moonstone-tableCellContent"]:contains("${text}")`).rightclick();
        cy.get('li[data-registry-key="action:edit"]').click();
        return new ContentEditor();
    }
}
