import {Table} from '@jahia/cypress';

export class ContentTable extends Table {
    getRowByLabel(label: string) {
        return cy.contains('[data-cm-role="table-content-list-row"]', label)
            .first()
            .scrollIntoView()
            .should('be.visible');
    }

    selectRowByLabel(label: string, isSelected = true) {
        return this.getRowByLabel(label)
            .find('[data-cm-role="table-content-list-cell-selection"] input')
            .click()
            .should('have.attr', 'aria-checked', Boolean(isSelected).toString());
    }
}
