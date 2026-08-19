import {BaseComponent, Button, getComponentByRole} from '@jahia/cypress';

export class PageBuilderModuleCreateButton extends BaseComponent {
    static defaultSelector = '[jahiatype="createbuttons"]';

    // A button's label is a translated content-type display name (e.g. "banner"'s), not
    // something these tests own; its exact capitalization can vary by which version of the
    // module that registers it is installed, and that's not what's under test here — whether the
    // button exists is. Hence matchCase: false.
    getButton(type: string): Button {
        return new Button(this.get().find('.moonstone-button').contains(type, {matchCase: false}));
    }

    getButtonByRole(role: string): Button {
        return getComponentByRole(Button, role, this);
    }

    getInsertionButtonByIndex(index: number, selRole: string = null): Button {
        return new Button(this.get().find(`button[data-sel-role="${selRole ? selRole : 'createContent'}"]`).eq(index));
    }

    assertHasNoButton(): void {
        this.get().find('.moonstone-button').should('not.exist');
    }

    assertHasNoButtonForType(type: string): void {
        this.get().find('.moonstone-button').contains(type, {matchCase: false}).should('not.exist');
    }

    assertHasNoButtonForRole(role: string): void {
        this.get().find(`.moonstone-button[data-sel-role="${role}"]`).should('not.exist');
    }
}
