import {BaseComponent, Button, getComponentByRole} from '@jahia/cypress';

export class PageBuilderModuleCreateButton extends BaseComponent {
    static defaultSelector = '[jahiatype="createbuttons"]';

    getButton(type: string): Button {
        return new Button(this.get().find('.moonstone-button').contains(type));
    }

    getButtonByRole(role: string): Button {
        return getComponentByRole(Button, role, this);
    }

    getInsertionButtonByIndex(index: number): Button {
        return new Button(this.get().find('button[data-sel-role="createContentPB"]').eq(index));
    }

    assertHasNoButton(): void {
        this.get().find('.moonstone-button').should('not.exist');
    }

    assertHasNoButtonForType(type: string): void {
        this.get().find('.moonstone-button').contains(type).should('not.exist');
    }

    assertHasNoButtonForRole(role: string): void {
        this.get().find(`.moonstone-button[data-sel-role="${role}"]`).should('not.exist');
    }
}
