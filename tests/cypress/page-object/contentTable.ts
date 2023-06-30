import {BaseComponent, Table, TableRow} from '@jahia/cypress';
import Chainable = Cypress.Chainable;

export class ContentTable extends Table {
    getRowByLabel(label: string): TableRow {
        cy.contains('[data-cm-role="table-content-list-row"]', label).first().as('rowByLabel');
        cy.get('@rowByLabel').scrollIntoView();
        cy.get('@rowByLabel').should('be.visible');
        return new TableRow(cy.get('@rowByLabel'));
    }

    selectRowByLabel(label: string, isSelected = true): Chainable {
        return this.getRowByLabel(label).get()
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click()
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }

    getHeaderByRole(role: string): ColumnHeader {
        cy.get(`[data-cm-role="table-content-list-header-cell-${role}"]`).first().as('headerByRole');
        cy.get('@headerByRole').scrollIntoView();
        cy.get('@headerByRole').should('be.visible');
        return new ColumnHeader(cy.get('@headerByRole'));
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
