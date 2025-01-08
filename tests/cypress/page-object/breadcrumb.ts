import {BaseComponent, Dropdown, getComponentBySelector} from '@jahia/cypress';

export class Breadcrumb extends BaseComponent {
    static defaultSelector = 'button[data-sel-role="breadcrumb-item"]';

    static findByContent(content: string) : Breadcrumb {
        return new Breadcrumb(cy.get(this.defaultSelector).contains(content));
    }

    static getBreadcrumbMenu() : Dropdown {
        return getComponentBySelector(Dropdown, 'div[data-sel-role="breadcrumb-item"]');
    }

    click() {
        this.element.click();
    }
}
