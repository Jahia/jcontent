import {BasePage} from '@jahia/cypress';

export class SidePanel extends BasePage {
    static defaultSelector = '[data-sel-role="side-panel"]';

    switchToTab(tabRole: string): this {
        cy.get(`[data-sel-role="${tabRole}"]`).then($tab => {
            if ($tab.attr('aria-selected') !== 'true') {
                cy.wrap($tab).click();
            }
        });
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

    getDetailsSection(content: 'technical' | 'additional') {
        return cy.get(`[data-sel-role="details-section"][data-sel-content="${content}"]`);
    }

    getDetailRow(label: string) {
        return cy.get(`[data-sel-role="detail-row"][data-sel-label="${label}"]`);
    }

    getHistoryFilter() {
        return cy.get('[data-sel-role="history-action-filter"]');
    }

    getHistoryItems() {
        return cy.get('[data-sel-role="history-item"]');
    }

    getPreviewFrame() {
        return cy.get('iframe[data-sel-role="edit-preview-frame"]');
    }
}
