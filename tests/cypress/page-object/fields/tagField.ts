import {Field} from './field';

export class TagField extends Field {
    addNewValue(text: string): void {
        this.get().find('input[type="text"]').type(`${text}{enter}`, {delay: 300, force: true});
        this.get().find('[role="button"]').contains(text).should('be.visible');
    }
}
