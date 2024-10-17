import {Field} from './field';
import {BaseComponent, getComponentBySelector} from '@jahia/cypress';

export class ChoiceTreeField extends Field {
    openTree(): ChoiceTree {
        const input = this.get().find('[data-sel-role="choice-tree"]');
        input.should('be.visible');
        input.click();
        return getComponentBySelector(ChoiceTree, '[data-sel-role="choice-tree"] menu');
    }

    getChoiceTreeInput(): Cypress.Chainable<JQuery> {
        return this.get().find('[data-sel-role="choice-tree"]');
    }

    closeTree(): ChoiceTreeField {
        cy.get('body').click();
        return this;
    }

    getValues(): Cypress.Chainable<JQuery> {
        return this.get().get('.moonstone-dropdown_tags').find('button');
    }

    removeValue(value: string): ChoiceTreeField {
        this.get().contains('.moonstone-dropdown_tags button', value).click();
        return this;
    }
}

export class ChoiceTree extends BaseComponent {
    getEntries(): Cypress.Chainable<JQuery> {
        return this.get().find('li');
    }

    openEntry(entry: string): ChoiceTree {
        this.get().contains('li', entry).find('.moonstone-treeView_itemToggle').click();
        return this;
    }

    selectEntry(entry: string): ChoiceTree {
        this.get().contains('li', entry).find('[role="checkbox"]').click();
        return this;
    }
}
