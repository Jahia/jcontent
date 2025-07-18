import {Button, getComponentByAttr, getComponentByRole} from '@jahia/cypress';
import {Picker} from '../picker';
import {Field} from './field';

export class PickerField extends Field {
    static ADD_FIELD_SEL = 'button[data-sel-action="addField"]';

    open(): Picker {
        const buttonSelector = this.multiple ? PickerField.ADD_FIELD_SEL : '[data-sel-field-picker-action]';
        this.get().find(buttonSelector).scrollIntoView({offset: {left: 0, top: -150}}).click({force: true});
        getComponentByAttr(Button, 'data-sel-picker-dialog-action', 'cancel').get().should('be.visible');
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
        return getComponentByRole(Picker, 'picker-dialog');
    }

    assertValue(value: string) {
        this.get().find('[data-testid="cardSelector-displayName"]').contains(value);
    }

    assertHasNoValue() {
        this.get().find('[data-testid="cardSelector-displayName"]').should('not.exist');
    }
}
