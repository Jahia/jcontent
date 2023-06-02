import {BaseComponent, TableRow, getComponentBySelector, Menu} from '@jahia/cypress';

export class ContentGrid extends BaseComponent {
    static defaultSelector = '[data-cm-role="grid-content-list"]';

    getCardByLabel(label: string): TableRow {
        cy.contains('[data-cm-role="grid-content-list-card"]', label).first().as('rowByLabel');
        cy.get('@rowByLabel').scrollIntoView();
        cy.get('@rowByLabel').should('be.visible');
        return new TableRow(cy.get('@rowByLabel'));
    }
}

export class GridCard extends BaseComponent {
    static defaultSelector = '[data-cm-role="grid-content-list-card"]';

    contextMenu() {
        this.get().rightclick();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }
}
