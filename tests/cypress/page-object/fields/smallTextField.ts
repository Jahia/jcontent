import {Field} from './field';

export class SmallTextField extends Field {
    static ADD_FIELD_SEL = 'button[data-sel-action="addField"]';

    addNewValue(newValue: string, force = false) {
        if (this.multiple) {
            this.get().find(SmallTextField.ADD_FIELD_SEL).click();
            this.get().find('input').last().as('textinput');
            // Prevent field from being hidden by sticky header
            this.get().scrollIntoView();
            cy.get('@textinput').type(newValue, {force: force});
            cy.get('@textinput').should('have.value', newValue);
        } else {
            this.get().find('input[type="text"]').as('textinput');
            // Prevent field from being hidden by sticky header
            this.get().scrollIntoView();
            cy.get('@textinput').clear({force: force, scrollBehavior: false});
            cy.get('@textinput').type(newValue, {force: force, scrollBehavior: false});
            cy.get('@textinput').should('have.value', newValue);
        }

        return this;
    }

    clearValue(force = false) {
        if (this.multiple) {
            // Handle clearing values of multiple values here
        } else {
            this.get().find('input[type="text"]').as('textinput');
            // Prevent field from being hidden by sticky header
            this.get().scrollIntoView();
            cy.get('@textinput').clear({force: force, scrollBehavior: false});
        }

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

    checkValues(expectedValues: string[]) {
        if (this.multiple) {
            this.get().find('input').should($input => {
                expect($input).to.have.length(expectedValues.length);
                expectedValues.forEach((value, index) => {
                    expect($input.eq(index), `Item ${index}`).to.have.value(expectedValues[index]);
                });
            }).last().focus();
        }
    }
}
