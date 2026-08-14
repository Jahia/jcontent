import {getComponentByAttr} from '@jahia/cypress';
import {Field} from './field';

// The generic "options in a menu, selected by their visible text" dropdown pattern -- e.g. the Day
// of Week visibility condition's multi-select. Distinct from ChoiceListField, which targets
// Moonstone's own '.moonstone-menuItem[data-value=...]' markup and selects by exact value; this
// field's underlying Dropdown variant (hasSearch) instead exposes a plain '[role="listbox"]'
// trigger/summary and a '<menu>' of options matched by their visible label.
export class ListBoxField extends Field {
    static getByFieldName(fieldName: string): ListBoxField {
        return getComponentByAttr(ListBoxField, 'data-sel-content-editor-field', fieldName);
    }

    // Opens the menu and clicks the option whose visible text matches `label` -- toggling it
    // in/out of the current selection -- then closes the menu by clicking elsewhere on the page,
    // since the field is multi-select and does not auto-close after a selection. `closePosition`
    // lets a caller pick a spot (e.g. 'top') that avoids the open menu covering another element,
    // such as a Save button, that it would otherwise obscure.
    toggleValue(label: string, closePosition?: Cypress.PositionType) {
        this.get().find('[role="listbox"]').click();
        this.get().find('menu').should('be.visible').contains(label).click();
        if (closePosition) {
            cy.get('body').click(closePosition);
        } else {
            cy.get('body').click();
        }

        return this;
    }

    shouldContainValue(label: string) {
        this.get().find('[role="listbox"]').should('contain', label);
        return this;
    }

    shouldNotContainValue(label: string) {
        this.get().find('[role="listbox"]').should('not.contain', label);
        return this;
    }
}
