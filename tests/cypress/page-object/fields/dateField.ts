import {getComponentByAttr} from '@jahia/cypress';
import {Field} from './field';

// Moonstone renders a date input plus, on datetime fields, a time input (the one with inputmode="numeric")
export class DateField extends Field {
    addNewValue(newValue: string, force?: boolean): this
    addNewValue(date: Date, force?: boolean): this

    addNewValue(newValueOrDate: string | Date, force?: boolean) {
        const newValue =
            newValueOrDate instanceof Date ? DateField.toPickerDisplayValue(newValueOrDate) : newValueOrDate;
        // `force` reaches clear() as well as type(): on a form long enough to make the section
        // header sticky, this input ends up position: fixed underneath it, and no scroll can
        // uncover it -- so both actions need it, not just the typing.
        const [date, time] = DateField.splitDateTime(newValue);
        this.getDateInput().clear({force: force}).type(date, {force: force}).should('have.value', date);
        if (time) {
            // Focusing the time input commits the typed date; blurring it commits the typed time
            this.getTimeInput().clear({force: force}).type(time, {force: force}).should('have.value', time).blur();
        }

        return this;
    }

    static getByFieldName(fieldName: string): DateField {
        return getComponentByAttr(DateField, 'data-sel-content-editor-field', fieldName);
    }

    // Formats `date` as the picker displays it (MM/DD/YYYY HH:mm for the Cypress browser's en-US locale)
    private static toPickerDisplayValue(date: Date): string {
        const pad = (n: number) => (n < 10 ? '0' : '') + n;
        return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // 'MM/DD/YYYY HH:mm' -> ['MM/DD/YYYY', 'HH:mm']; 'MM/DD/YYYY' -> ['MM/DD/YYYY', undefined]
    private static splitDateTime(value: string): [string, string | undefined] {
        const [date, time] = value.split(' ');
        return [date, time];
    }

    // A datetime field has two text inputs; blur whichever one currently holds the focus.
    blurTextField() {
        this.get().then($field => {
            const $focused = $field.find('input:focus');
            if ($focused.length > 0) {
                cy.wrap($focused).blur();
            }
        });
        return this;
    }

    getDateInput() {
        return this.get().find('input:not([inputmode="numeric"])');
    }

    getTimeInput() {
        return this.get().find('input[inputmode="numeric"]');
    }

    // Clears every sub-input without typing a replacement; the commit to form state happens on blur
    clearValue() {
        this.get().find('input').each($input => cy.wrap($input).clear());
        return this;
    }

    // Asserts the field holds no actual date/time: no sub-input contains any digit
    checkEmpty() {
        this.get().find('input').each($input => cy.wrap($input).invoke('val').should('match', /^\D*$/));
        return this;
    }

    public open() {
        this.getDateInput().click();
        cy.get('[data-testid="calendar"]').should('be.visible');
        return this;
    }

    public close() {
        // Escape in the date input closes the popover without selecting anything
        this.getDateInput().type('{esc}');
        cy.get('[data-testid="calendar"]').should('not.exist');
    }

    pickTodayDate() {
        this.open();
        cy.get('[data-testid="calendar"]').find('[data-today] button').click();
        // Selecting a day closes the popover on its own
        cy.get('[data-testid="calendar"]').should('not.exist');
    }

    select({time}: {time?: string}) {
        if (time) {
            // Blur commits the typed time to the field
            this.getTimeInput().clear().type(time).blur();
        }
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
        const [date, time] = DateField.splitDateTime(expectedValue);
        this.getDateInput().should('have.value', date);
        if (time) {
            this.getTimeInput().should('have.value', time);
        }
    }
}
