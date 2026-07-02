import {BaseComponent, getComponent, Table, TableRow} from '@jahia/cypress';
import {DeleteDialog, DeletePermanentlyDialog} from './deleteDialog';
import {JContentMenu} from './jcontentMenu';
import Chainable = Cypress.Chainable;
import ClickOptions = Cypress.ClickOptions

export class ContentTable extends Table {
    /**
     * @deprecated use getRowByName() instead
     */
    getRowByLabel(label: string): ContentTableRow {
        cy.contains('[data-cm-role="table-content-list-row"]', label).first().as('rowByLabel');
        cy.get('@rowByLabel').scrollIntoView();
        cy.get('@rowByLabel').should('be.visible');
        return new ContentTableRow(cy.get('@rowByLabel'));
    }

    getRowByName(name: string): ContentTableRow {
        cy.get(`[data-cm-role="table-content-list-row"][data-node-name="${name}"]`).first().as('rowByName');
        cy.get('@rowByName').scrollIntoView();
        cy.get('@rowByName').should('be.visible');
        return new ContentTableRow(cy.get('@rowByName'));
    }

    /**
     * @deprecated use selectRowByName() instead
     */
    selectRowByLabel(label: string, isSelected = true): Chainable {
        return this.getRowByLabel(label)
            .get()
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click()
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }

    selectRowByName(name: string, isSelected = true): Chainable {
        return this.getRowByName(name)
            .get()
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click()
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }

    shiftSelectRowByName(name: string, isSelected = true): Chainable {
        return this.getRowByName(name)
            .get()
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click({shiftKey: true})
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }

    getHeaderByRole(role: string): ColumnHeader {
        cy.get(`[data-cm-role="table-content-list-header-cell-${role}"]`).first().as('headerByRole');
        cy.get('@headerByRole').scrollIntoView();
        cy.get('@headerByRole').should('be.visible');
        return new ColumnHeader(cy.get('@headerByRole'));
    }
}

export class ContentTableRow extends TableRow {
    contextMenu(): JContentMenu {
        // Row can be partially hidden by new JContent side panel.
        // As workaround, we right click from the left with a fixed offset
        this.get().find('[data-cm-role^="table-content-list-cell-name"]').rightclick('left');
        return new JContentMenu(cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)'));
    }

    isSelected(isSelected = true) {
        this.element
            .find('td[data-cm-role="table-content-list-cell-selection"] input')
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
        return this;
    }

    markForDeletion(): ContentTableRow {
        this.contextMenu().selectByRole('delete');
        getComponent(DeleteDialog).markForDeletion();
        this.get().find('[data-marked-for-deletion="true"]').should('exist');
        return this;
    }

    deletePermanently(): ContentTableRow {
        this.contextMenu().selectByRole('deletePermanently');
        getComponent(DeletePermanentlyDialog).delete();
        return this;
    }

    click(options?: Partial<ClickOptions>) {
        // Row can be partially hidden by new JContent side panel.
        // As workaround, we right click from the left with a fixed offset
        this.get().find('[data-cm-role^="table-content-list-cell-name"]').click('left', options);
    }

    dblclick(options?: Partial<ClickOptions>) {
        // Row can be partially hidden by new JContent side panel.
        // As workaround, we right click from the left with a fixed offset
        return this.get().find('[data-cm-role^="table-content-list-cell-name"]').dblclick('left', options);
    }
}

export class ColumnHeader extends BaseComponent {
    static defaultSelector = '.columnheader';

    isSortable() {
        this.get().find('.moonstone-SortIndicator').should('exist').and('be.visible');
    }

    isSorted() {
        this.get().find('.moonstone-SortIndicator-sorted').should('exist').and('be.visible');
    }

    sort() {
        this.get().find('.moonstone-SortIndicator').should('exist').and('be.visible').click();
    }

    isNotSortable() {
        this.get().find('.moonstone-SortIndicator').should('not.exist');
    }
}
