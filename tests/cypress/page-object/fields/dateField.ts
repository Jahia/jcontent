import {getComponentByAttr} from '@jahia/cypress';
import {Field} from './field';

export class DateField extends Field {
    addNewValue(newValue: string, force?: boolean): this
    addNewValue(date: Date): this

    addNewValue(newValueOrDate: string | Date, force?: boolean) {
        const newValue =
            newValueOrDate instanceof Date ? DateField.toPickerDisplayValue(newValueOrDate) : newValueOrDate;
        this.get().find('input[type="text"]').clear().type(newValue, {force: force}).should('have.value', newValue);
        return this;
    }

    static getByFieldName(fieldName: string): DateField {
        return getComponentByAttr(DateField, 'data-sel-content-editor-field', fieldName);
    }

    // The value this field's masked input displays for `date`, formatted to match what the mask
    // shows back (MM/DD/YYYY HH:mm, matching the 'en-US' navigator.language the Cypress browser
    // reports).
    private static toPickerDisplayValue(date: Date): string {
        const pad = (n: number) => (n < 10 ? '0' : '') + n;
        return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // Clears the field WITHOUT typing a replacement -- e.g. to verify clearing an existing date
    // and saving actually removes it. Deliberately does not assert against a specific "empty"
    // value here: the masked input resets to its own placeholder string (e.g.
    // "__/__/____ __:__"), not a bare '', and that placeholder's exact shape depends on the
    // locale-derived date format -- see checkEmpty() for a format-agnostic way to verify it.
    clearValue() {
        this.get().find('input[type="text"]').clear();
        return this;
    }

    // Asserts the field holds no actual date/time -- i.e. its displayed value contains no digits
    // at all, only the mask's own placeholder/separator characters. Format-agnostic: robust
    // regardless of which locale-derived mask shape (date-only vs datetime, MM/DD vs DD/MM) is
    // in effect, unlike asserting an exact placeholder string.
    checkEmpty() {
        this.get().find('input').invoke('val').should('match', /^\D*$/);
        return this;
    }

    public open() {
        this.get().parent().find('button').click();
    }

    public close() {
        cy.get('.DayPicker').parent().parent().parent().parent().click({waitForAnimations: true, multiple: true});
        cy.get('.DayPicker').should('not.exist');
    }

    pickTodayDate() {
        this.open();
        cy.get('.DayPicker-Day--today').click();
        this.close();
    }

    select({month = null, year = null, date = null, time = null}) {
        this.open();
        if (month) {
            cy.get('.DayPicker').find('#select-month').click();
            cy.get('#menu-month').find(`[data-value=${month}]`).click();
        }

        if (year) {
            cy.get('.DayPicker').find('#select-year').click();
            cy.get('#menu-year').find(`[data-value=${year}]`).click();
        }

        if (date) {
            cy.get('.DayPicker').find('.DayPicker-Body').contains(date).click();
        }

        if (time) {
            cy.get('.TimePicker').contains(time).click();
        }

        this.close();
    }

    getTodayDate(): string {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return new Date(year, month, day).toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    checkValue(expectedValue: string) {
        this.get().find('input').should('have.value', expectedValue);
    }
}
