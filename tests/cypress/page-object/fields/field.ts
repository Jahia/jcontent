import {BaseComponent} from '@jahia/cypress';

export class Field extends BaseComponent {
    fieldName: string;
    multiple: boolean;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkValue(text: string): void {
        // Empty method
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addNewValue(text: string): void {
        // Empty method
    }

    assertVisible() {
        this.get().scrollIntoView({offset: {top: -200, left: 0}});
        this.get().should('be.visible');
        return this;
    }

    hasMandatory() {
        this.get().scrollIntoView().find('[data-sel-content-editor-field-mandatory]')
            .should('be.visible')
            .and('have.attr', 'data-sel-content-editor-field-mandatory', 'true');
    }

    isReadOnly() {
        this.get().should('have.attr', 'data-sel-content-editor-field-readonly', 'true');
    }

    isNotReadOnly() {
        this.get().invoke('attr', 'data-sel-content-editor-field-readonly').should('not.eq', 'true');
    }

    getTranslateFieldAction(): Cypress.Chainable {
        return this.get().scrollIntoView().parent().find('[data-sel-role="translate-field"]');
    }

    getErrorMessage(): Cypress.Chainable {
        return this.get().scrollIntoView().find('[data-sel-error]');
    }
}
