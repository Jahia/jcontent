import {BaseComponent, Button, getComponentByRole} from '@jahia/cypress';

export class PageBuilderModuleHeader extends BaseComponent {
    static defaultSelector = '[jahiatype="header"]';

    assertStatus(value: string) {
        this.get().find('[data-sel-role="content-status"]').contains(value);
    }

    getButton(role: string): Button {
        return getComponentByRole(Button, role, this);
    }

    assertHeaderText(text: string) {
        this.get().find('p').contains(text);
    }

    select() {
        this.get().click({metaKey: true, force: true});
    }
}
