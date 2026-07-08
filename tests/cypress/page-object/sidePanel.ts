import {BasePage} from '@jahia/cypress';
import {ContentEditor} from './contentEditor';

export class SidePanel extends BasePage {
    static defaultSelector = '[data-sel-role="side-panel"]';

    private selectorScope = '';

    withScope(selectorScope: string): this {
        this.selectorScope = selectorScope;
        return this;
    }

    inCE() {
        return this.withScope(ContentEditor.defaultSelector);
    }

    private scoped(selector: string) {
        return this.selectorScope ? `${this.selectorScope} ${selector}` : selector;
    }

    switchToTab(tabRole: string): this {
        cy.get(this.scoped(`[data-sel-role="${tabRole}"]`)).then($tab => {
            if ($tab.attr('aria-selected') !== 'true') {
                cy.get(this.scoped(`[data-sel-role="${tabRole}"]`)).click({force: true});
            }
        });
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
        return this;
    }

    switchToDetailsTab(): this {
        return this.switchToTab('tab-details');
    }

    switchToHistoryTab(): this {
        return this.switchToTab('tab-history');
    }

    switchToPreviewTab(): this {
        return this.switchToTab('tab-preview');
    }

    switchToUsagesTab(): this {
        return this.switchToTab('tab-usages');
    }

    getByRole(role: string) {
        return cy.get(this.scoped(`[data-sel-role="${role}"]`));
    }

    getSidePanel() {
        return this.getByRole('side-panel');
    }

    getDetailsSection(content: 'technical' | 'additional') {
        return cy.get(this.scoped(`[data-sel-role="details-section"][data-sel-content="${content}"]`));
    }

    getDetailRow(label: string) {
        return cy.get(this.scoped(`[data-sel-role="detail-row"][data-sel-label="${label}"]`));
    }

    getHistoryFilter() {
        return cy.get(this.scoped('[data-sel-role="history-action-filter"]'));
    }

    getHistoryItems() {
        return cy.get(this.scoped('[data-sel-role="history-item"]'));
    }

    getPreviewFrame() {
        return cy.get(this.scoped('iframe[data-sel-role="edit-preview-frame"]'));
    }

    getUsagesTable() {
        return cy.get(this.scoped('[data-sel-role="usages-table"]'));
    }

    getUsagesRows() {
        return this.getUsagesTable().find('tbody tr');
    }
}
