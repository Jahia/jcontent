import {Dropdown, getComponent, getComponentBySelector, Menu} from '@jahia/cypress';
import {Field} from './field';

export class ChoiceListField extends Field {
    /**
     * Adds a new value to the choice list by selecting it from the dropdown.
     * @param value The value to add (must match exactly).
     */
    addNewValue(value: string): void {
        this.get().should('exist').click();
        getComponentBySelector(Menu, '[role="list"]').selectByValue(value);
    }

    /**
     * Asserts that the currently selected value in the choice list matches the given value exactly.
     * @param value The expected selected value (exact match).
     */
    assertSelected(value: string): void {
        this.get().find('.moonstone-dropdown').should('have.text', value);
    }

    /**
     * Selects one or more values in a multi-select choice list and closes the dropdown.
     * Throws an error if used on a single-value choice list.
     * @param values The exact values to select.
     */
    selectValues(values: string[]): void {
        if (!this.multiple) {
            throw new Error('Cannot use selectValues(string[]) for single-value choice list, use selectValue(string) instead');
        }

        this.openDropdown();
        const menu = getComponent(Menu, this);
        values.forEach(value => {
            menu.selectByValue(value);
        });
        this.closeDropdown();
    }

    /**
     * Selects a value in a single-value choice list and closes the dropdown.
     * Throws an error if used on a multi-value choice list.
     * @param value The exact value to select.
     */
    selectValue(value: string): void {
        if (this.multiple) {
            throw new Error('Cannot use selectValue(string) for single-value choice list, use selectValues(string[]) instead');
        }

        this.openDropdown();
        const menu = getComponent(Menu, this);
        menu.selectByValue(value);
        // For single-value choice lists, selecting the value closes the dropdown, no need to call this.closeDropdown()
    }

    /**
     * Opens the dropdown, asserts that all currently selected values in a multi-select choice list match the provided values exactly and closes the dropdown.
     * The number and content of selected values must match exactly.
     * Throws an error if used on a single-value choice list.
     * @param values The exact set of values expected to be selected.
     */
    shouldHaveSelectedValues(values: string[]): void {
        if (!this.multiple) {
            throw new Error('Cannot use shouldHaveSelectedValues(string[]) for single-value choice list, use shouldHaveSelectedValue(string) instead');
        }

        this.openDropdown();
        values.forEach(value => {
            this.get().find(`.moonstone-menuItem[data-value="${value}"][data-selected=true]`).should('exist');
        });
        // The count of selected items should match
        this.get().find('.moonstone-menuItem[data-selected=true]').should('have.length', values.length);
        this.closeDropdown();
    }

    /**
     * Opens the dropdown, asserts that the currently selected value in a single-value choice list matches the provided value exactly and closes the dropdown.
     * Throws an error if used on a multi-value choice list.
     * @param value The exact value expected to be selected.
     */
    shouldHaveSelectedValue(value: string): void {
        if (this.multiple) {
            throw new Error('Cannot use shouldHaveSelectedValue(string) for single-value choice list, use shouldHaveSelectedValues(string[]) instead');
        }

        this.openDropdown();
        this.get().find(`.moonstone-menuItem.moonstone-selected[data-value="${value}"]`).should('exist');
        this.closeDropdown();
    }

    /**
     * Opens the dropdown, asserts that the available values in the choice list match the provided list exactly (order and content) and closes the dropdown.
     * Opens the dropdown to check and closes it after.
     * @param values The exact set of values expected to be available.
     */
    shouldHaveValues(values: string[]): void {
        this.openDropdown();
        values.forEach(value => {
            this.get().find(`.moonstone-menuItem[data-value="${value}"]`).should('exist');
        });
        // The count of available items should match
        this.get().find('.moonstone-menuItem').should('have.length', values.length);
        this.closeDropdown();
    }

    private openDropdown(): void {
        // Ensure the choice list is ready
        this.get().find('[data-sel-content-editor-select-readonly=false]').should('exist');
        const dropdown = getComponent(Dropdown, this).get().should('exist');
        dropdown.then($el => {
            // Only click if menu is not visible
            if ($el.find('.moonstone-menu').length === 0) {
                dropdown.click();
            }
        });
        // Wait for the menu to be visible
        this.get().find('.moonstone-menu').should('exist');
    }

    private closeDropdown(): void {
        // Ensure the choice list is ready
        this.get().find('[data-sel-content-editor-select-readonly=false]').should('exist');
        const dropdown = getComponent(Dropdown, this).get().should('exist');
        dropdown.then($el => {
            // Only click if menu is visible
            if ($el.find('.moonstone-menu').length > 0) {
                dropdown.click();
            }
        });
        // Wait for the menu to be hidden
        this.get().find('.moonstone-menu').should('not.exist');
    }
}
