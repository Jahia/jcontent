import {getComponentBySelector, Menu} from '@jahia/cypress';
import {Field} from './field';

export class ChoicelistField extends Field {
    addNewValue(value: string): void {
        this.get().click();
        getComponentBySelector(Menu, '[role="listbox"]').selectByValue(value);
    }

    assertSelected(value: string): void {
        this.get().find('.moonstone-dropdown').should('have.text', value);
    }
}
