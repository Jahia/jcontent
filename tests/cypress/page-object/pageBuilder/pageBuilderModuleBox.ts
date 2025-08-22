import {BaseComponent} from '@jahia/cypress';
import {PageBuilderModuleHeader} from './pageBuilderModuleHeader';

export class PageBuilderModuleBox extends BaseComponent {
    static readonly defaultSelector: string = '[data-sel-role="page-builder-box"]';

    getHeader(): PageBuilderModuleHeader {
        return new PageBuilderModuleHeader(this.get().find('[jahiatype="header"]'));
    }

    getStatus(status: string) {
        this.get().find(`[data-sel-role="content-status"][data-status-type="${status}"]`).scrollIntoView();
        return this.get().find(`[data-sel-role="content-status"][data-status-type="${status}"]`);
    }

    /*
     * Use specifically to check when expected for content to have other statuses displayed (i.e. box element exists)
     * Otherwise use `assertBoxNotExist` when there are no badges displayed
     */
    assertNoStatus(status: string) {
        this.get().scrollIntoView();
        return this.get().find(`[data-sel-role="content-status"][data-status-type="${status}"]`).should('not.exist');
    }

    assertIsHovered(): Cypress.Chainable<JQuery> {
        return this.get().should('have.attr', 'data-box-hovered', 'true');
    }

    assertIsSelected(): Cypress.Chainable<JQuery> {
        return this.get().should('have.attr', 'data-box-selected', 'true');
    }

    assertIsClicked(): Cypress.Chainable<JQuery> {
        return this.get().should('have.attr', 'data-box-clicked', 'true');
    }
}
