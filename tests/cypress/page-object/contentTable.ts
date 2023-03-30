import {Table, TableRow} from '@jahia/cypress';
import Chainable = Cypress.Chainable;

export class ContentTable extends Table {
    getRowByLabel(label: string): TableRow {
        return new TableRow(cy.contains('[data-cm-role="table-content-list-row"]', label)
            .first()
            .scrollIntoView()
            .should('be.visible'));
    }

    selectRowByLabel(label: string, isSelected = true): Chainable {
        return this.getRowByLabel(label).get()
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click()
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }
}
