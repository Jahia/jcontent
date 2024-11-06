import {BaseComponent, getComponentBySelector} from '@jahia/cypress';

export class CompareDialog extends BaseComponent {
    static defaultSelector = 'div[data-sel-role="compare-dialog"]';

    getStagingFrame() {
        return this.get()
            .get('iframe[data-sel-role="staging-frame"]')
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap);
    }

    getLiveFrame() {
        return this.get()
            .get('iframe[data-sel-role="live-frame"]')
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap);
    }

    highlightToggle() {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        this.get().get('button[data-sel-role="highlight"]').should('be.visible').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
    }

    refresh() {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        this.get().get('button[data-sel-role="compare-refresh"]').should('be.visible').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
    }

    publish() {
        this.get().find('[data-sel-role="publish"]').click();
        cy.get('#publishNowButton').should('be.visible').find('button').contains('Publish now').click();
        cy.get('div[id="notistack-snackbar"]', {timeout: 3000}).contains('Publication completed', {timeout: 3000}).should('exist');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
    }
}
