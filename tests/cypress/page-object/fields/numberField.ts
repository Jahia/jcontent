import {Field} from './field';

export class NumberField extends Field {
    addNewValue(newValue: string, force = false) {
        this.get().find('input[type="number"]').as('numberinput');
        // Prevent field from being hidden by sticky header
        this.get().scrollIntoView();
        cy.get('@numberinput').clear({force: force, scrollBehavior: false});
        cy.get('@numberinput').type(String(newValue), {force: force, scrollBehavior: false});
        cy.get('@numberinput').should('have.value', String(newValue));

        return this;
    }

    clearValue(force = false) {
        this.get().find('input[type="number"]').as('numberinput');
        // Prevent field from being hidden by sticky header
        this.get().scrollIntoView();
        cy.get('@numberinput').clear({force: force, scrollBehavior: false});

        return this;
    }

    checkValue(expectedValue: string) {
        return this.get().find('input').last().should('have.value', expectedValue);
    }

    isReadOnly() {
        return this.get().find('input').should('have.attr', 'readonly');
    }

    isNotReadOnly() {
        return this.get().find('input').should('not.have.attr', 'readonly');
    }
}
