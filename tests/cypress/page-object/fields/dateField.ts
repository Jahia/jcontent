import {Field} from './field';

export class DateField extends Field {
    addNewValue(newValue: string, force?: boolean) {
        this.get().find('input[type="text"]')
            .clear().type(newValue, {force: force})
            .should('have.value', newValue);
        return this;
    }

    public open() {
        this.get().find('button').click();
    }

    pickTodayDate() {
        this.open();
        cy.get('.DayPicker-Day--today').click();
        cy.get('body').click();
    }

    select({month = null, year = null, date = null, time = null}) {
        this.get().find('button').click();
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

        cy.get('body').click();
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
