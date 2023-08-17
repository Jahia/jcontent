import {BasePage} from '@jahia/cypress';
import IframeOptions = Cypress.IframeOptions;

export class PageComposerContextualMenu extends BasePage {
    iFrameOptions: IframeOptions;
    contextMenuId: string;

    constructor(contextMenuId: string) {
        super();
        this.contextMenuId = contextMenuId;
    }

    delete() {
        this.execute('Delete', () => {
            cy.get('.delete-item-window .button-yes button').click();
        });
    }

    deletePermanently() {
        this.execute('Delete (permanently)', () => {
            cy.get('.delete-item-window .button-yes button').click();
        });
    }

    openDeleteDialog() {
        this.execute('Delete');
    }

    openDeletePermanentlyDialog() {
        this.execute('Delete (permanently)');
    }

    openUndeleteDialog() {
        this.execute('Undelete');
    }

    execute(action: string, thenFunction?: () => void) {
        cy.log('Execute action: ' + action);
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get(this.contextMenuId).contains(action).click({force: true});
            if (thenFunction) {
                thenFunction();
            }
        });
    }
}
