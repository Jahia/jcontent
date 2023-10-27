import {ContentEditor} from './contentEditor';

export class RepositoryExplorer {
    iframe = 'iframe[src*="/engines/manager.jsp?conf=repositoryexplorer"]';
    static open() {
        cy.get('[role="repository-explorer-menu-item"]').click();
        return new RepositoryExplorer();
    }

    openSection(text: string) {
        cy.iframe(this.iframe).within(() => {
            cy.get(`div[role="row"]:contains("${text}")`).find('img[class*="x-tree3-node-joint"]').click();
        });
    }

    editItem(text: string) {
        cy.iframe(this.iframe).within(() => {
            cy.get(`div[role="row"]:contains("${text}")`).rightclick();
            cy.get('span[class*="toolbar-item-editcontent"]').click();
        });
        return new ContentEditor();
    }
}
