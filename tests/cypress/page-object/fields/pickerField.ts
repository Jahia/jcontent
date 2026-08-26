import {Button, getComponentByAttr, getComponentByRole, getComponentBySelector, Menu} from '@jahia/cypress';
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

    /**
     * Opens the three-dots menu beside the reference card. Only a single-valued picker draws one:
     * content-editor/field/MultiplePicker is registered but rendered nowhere, so a multiple field
     * has move and remove buttons and no menu to open.
     */
    openMenu(): Menu {
        this.get()
            .find('[data-sel-role="content-editor/field/Picker"]')
            .scrollIntoView({offset: {left: 0, top: -150}})
            .click({force: true});
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }
}
