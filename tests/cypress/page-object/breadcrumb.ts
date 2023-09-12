import {BaseComponent} from '@jahia/cypress';

export class Breadcrumb extends BaseComponent {
    static defaultSelector = 'button[data-sel-role="breadcrumb-item"]';

    static findByContent(content: string) : Breadcrumb {
        return new Breadcrumb(cy.get(this.defaultSelector).contains(content));
    }

    click() {
        this.element.click();
    }
}

export class BreadcrumbPageBuilder extends BaseComponent {
    static defaultSelector = 'nav[data-sel-role="pagebuilder-breadcrumb"]';

    shouldHaveCount(count: number): void {
        this.get().find('li').should('have.length', count);
    }

    select(name: string): void {
        this.get().find('span').contains(name).click({force: true});
    }

    click() {
        this.element.click();
    }
}
