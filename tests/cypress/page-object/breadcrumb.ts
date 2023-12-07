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

    selectPos(pos: number) {
        const truePos = (pos * 2) - 1; // We need to skip the li separators
        this.get().find(`li:nth-child(${truePos}) span`).click({force: true});
    }

    addToSelection(name: string): void {
        this.get().find('span').contains(name).click({force: true, metaKey: true});
    }

    click() {
        this.element.click();
    }
}
