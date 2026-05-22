import {Field} from './field';

export class TagField extends Field {
    type(text: string, options = {delay: 100, force: true}) {
        return this.get().find('input[type="text"]').type(text, options);
    }

    clear() {
        return this.get().find('input[type="text"]').clear();
    }

    addNewValue(text: string): void {
        this.type(`${text}{enter}`);
        this.getTags().contains(text).should('be.visible');
    }

    getTags() {
        return this.get().find('[role="button"]');
    }

    assertTagText(text: string, index: number): void {
        this.getTags().eq(index).should('have.text', text);
    }
}
