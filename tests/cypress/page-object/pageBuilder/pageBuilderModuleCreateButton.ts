import {BaseComponent, Button} from '@jahia/cypress';

export class PageBuilderModuleCreateButton extends BaseComponent {
    static defaultSelector = '[jahiatype="createbuttons"]';

    getButton(type: string): Button {
        return new Button(this.get().find('.moonstone-button').contains(type));
    }

    getFirstInsertionButton(): Button {
        return new Button(this.get().find('button[data-sel-role="createContent"]').first());
    }

    assertHasNoButton(): void {
        this.get().find('.moonstone-button').should('not.exist');
    }

    assertHasNoButtonForType(type: string): void {
        this.get().find('.moonstone-button').contains(type).should('not.exist');
    }
}
