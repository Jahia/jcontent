import {getComponentBySelector, Menu} from '@jahia/cypress';
import {Field} from './field';

export class ChoicelistField extends Field {
    addNewValue(value: string): void {
        this.get().click();
        const choicelistMenu = getComponentBySelector(Menu, '[role="listbox"]');

        const itemSel = `.moonstone-menuItem[data-value="${value}"]`;
        choicelistMenu.get().find(itemSel).scrollIntoView().should('be.visible');
        choicelistMenu.get().find(itemSel).click();
    }

    assertSelected(value: string): void {
        this.get().find('.moonstone-dropdown').should('have.text', value);
    }
}
