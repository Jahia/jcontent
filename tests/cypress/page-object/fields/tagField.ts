import {Field} from './field';

export class TagField extends Field {
    type(text: string, options = {delay: 100, force: true}) {
        return this.get().find('input[type="text"]').type(text, options);
    }

    clear() {
        return this.get().find('input[type="text"]').clear();
    }

    addNewValue(text: string): void {
        this.addNewValues([text]);
    }

    addNewValues(texts: string[]) {
        const text = texts.join(',');
        this.type(text);
        // Wait for React-Select's creatable option to render before pressing Enter — under fields
        // that load their options remotely (e.g. dynamicChoicelist) the {enter} otherwise fires
        // before anything is focused and no chip gets added.
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000}).contains(text).should('be.visible');
        this.type('{enter}');
        texts.forEach(t => this.getTags().contains(t.toLowerCase()).should('be.visible'));
    }

    getTags() {
        return this.get().find('[role="button"]');
    }

    assertTagText(text: string, index: number): void {
        this.getTags().eq(index).should('have.text', text);
    }
}
