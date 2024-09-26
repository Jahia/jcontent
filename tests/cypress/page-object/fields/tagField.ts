import {Field} from './field';

export class TagField extends Field {

    addNewValue(text: string): void {
        this.get().find(`#${this.fieldName}`).type(`${text}{enter}`, {delay: 500});
        this.get().find(`#${this.fieldName} [role="button"]`).contains(text).should('be.visible');
    }
}
