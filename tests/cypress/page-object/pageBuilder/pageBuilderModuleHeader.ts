import {BaseComponent, Button, getComponentByRole} from '@jahia/cypress';

export class PageBuilderModuleHeader extends BaseComponent {
    static defaultSelector = '[jahiatype="header"]';

    assertStatus(value: string) {
        this.should('be.visible');
        this.get().find('[data-sel-role="content-status"]').contains(value);
    }

    getButton(role: string): Button {
        this.should('be.visible');
        return getComponentByRole(Button, role, this);
    }

    assertHeaderText(text: string) {
        this.should('be.visible');
        this.get().find('p').contains(text);
    }

    scrollToTop(): this {
        cy.get('iframe[data-sel-role="page-builder-frame-active"]').then($iframe => {
            $iframe[0].contentWindow.scrollTo(0, 0);
        });
        return this;
    }

    select() {
        this.should('be.visible');
        this.get().click({metaKey: true, force: true});
    }
}
