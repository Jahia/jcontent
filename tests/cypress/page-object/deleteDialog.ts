import {BaseComponent, Button, getComponentByRole} from '@jahia/cypress';

export class DeleteDialog extends BaseComponent {
    static defaultSelector = 'div[data-sel-role="delete-mark-dialog"]';

    markForDeletion(verifyMsg?: string) {
        if (verifyMsg) {
            this.assertMessage(verifyMsg);
        }

        getComponentByRole(Button, 'delete-mark-button').click();
        cy.get(DeleteDialog.defaultSelector).should('not.exist');
    }

    toggleRowExpanded() {
        cy.get('.moonstone-TableCell[title="Toggle Row Expanded"] > svg').click({force: true});
        return this;
    }

    assertMessage(verifyMsg: string) {
        this.get().should('contain', verifyMsg);
        return this;
    }

    close() {
        getComponentByRole(Button, 'close-button').click();
        cy.get(DeleteDialog.defaultSelector).should('not.exist');
    }
}

export class DeletePermanentlyDialog extends BaseComponent {
    static defaultSelector = 'div[data-sel-role="delete-permanently-dialog"]';

    delete() {
        this.assertMessage('You are about to permanently delete');
        getComponentByRole(Button, 'delete-permanently-button').click();
        cy.get(DeletePermanentlyDialog.defaultSelector).should('not.exist');
    }

    assertMessage(verifyMsg: string) {
        this.get().should('contain', verifyMsg);
        return this;
    }

    close() {
        getComponentByRole(Button, 'close-button').click();
        cy.get(DeletePermanentlyDialog.defaultSelector).should('not.exist');
    }
}

export class UndeleteDialog extends BaseComponent {
    static defaultSelector = 'div[data-sel-role="delete-undelete-dialog"]';

    undelete(verifyMsg?: string) {
        if (verifyMsg) {
            this.assertMessage(verifyMsg);
        }

        getComponentByRole(Button, 'delete-undelete-button').click();
        cy.get(UndeleteDialog.defaultSelector).should('not.exist');
    }

    assertMessage(verifyMsg: string) {
        this.get().should('contain', verifyMsg);
        return this;
    }

    close() {
        getComponentByRole(Button, 'close-button').click();
        cy.get(UndeleteDialog.defaultSelector).should('not.exist');
    }
}
