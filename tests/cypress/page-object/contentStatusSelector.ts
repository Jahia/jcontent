import {Dropdown, getComponent, Menu} from '@jahia/cypress';

export class ContentStatusSelector extends Dropdown {
    static defaultSelector = '.moonstone-dropdown_container[data-sel-role="status-view-mode-dropdown"]';

    selectByRole(item: string) {
        this.get().click();
        this.get().find('menu.moonstone-menu').should('be.visible');
        getComponent(Menu, this).selectByRole(item);
    }

    getStatus(status: string) {
        return this.get().find(`.moonstone-menuItem[data-sel-role="status-view-mode-${status}"]`);
    }

    assertCount(status: string, count: number) {
        this.get().click();
        this.getStatus(status).should('contain', count);
        this.get().click();
    }

    showNoStatus() {
        this.selectByRole('status-view-mode-noStatus');
    }

    showPublication() {
        this.selectByRole('status-view-mode-published');
    }

    showVisibility() {
        this.selectByRole('status-view-mode-visibility');
    }

    showPermission() {
        this.selectByRole('status-view-mode-permissions');
    }
}
