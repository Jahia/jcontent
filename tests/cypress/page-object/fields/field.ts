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

    hasMandatory() {
        this.get().scrollIntoView().find('[data-sel-content-editor-field-mandatory]')
            .should('be.visible')
            .and('have.attr', 'data-sel-content-editor-field-mandatory', 'true');
    }
}
