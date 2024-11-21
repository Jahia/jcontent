import {BaseComponent, Button, Dropdown, getComponentByRole} from '@jahia/cypress';
import {Picker} from './picker';
import {DateField} from './fields';

export class CustomizedPreviewDialog extends BaseComponent {
    static defaultSelector = '[data-sel-role="customized-preview-dialog"]';

    apply() {
        getComponentByRole(Button, 'show-preview-confirm', this).click();
        this.get().should('not.exist');
    }

    clearAll() {
        getComponentByRole(Button, 'clear-all', this).click();
    }

    selectUser(user: string) {
        this.getUserSelector().click();
        const picker = getComponentByRole(Picker, 'user-selector-dialog');
        picker.should('be.visible');
        picker.search(user);
        picker.verifyResultsLength(1);
        picker.getTable().getRowByIndex(1).get().click();
        picker.select();
    }

    selectChannel(name: string) {
        const dropdown = this.getChannelDropdown();
        dropdown.get().find('[role=dropdown]:not(.moonstone-disabled)');
        dropdown.select(name).get().should('contain', name);
    }

    selectVariant(name: string) {
        const dropdown = this.getVariantDropdown();
        dropdown.get().find('[role=dropdown]:not(.moonstone-disabled)');
        dropdown.select(name).get().should('contain', name);
    }

    selectTodayDate() {
        const dateField = getComponentByRole(DateField, 'date-selector-input');
        dateField.pickTodayDate();
    }

    getChannelDropdown() {
        return getComponentByRole(Dropdown, 'channel-selector-dropdown', this);
    }

    getVariantDropdown() {
        return getComponentByRole(Dropdown, 'variant-selector-dropdown', this);
    }

    getUserSelector() {
        return cy.get('[data-sel-field-picker-action="openPicker"]');
    }
}
