import {BaseComponent, getComponentBySelector, Menu} from '@jahia/cypress';
import ClickOptions = Cypress.ClickOptions;
import {PageBuilderModuleHeader} from './pageBuilderModuleHeader';
import {PageBuilderModuleFooter} from './pageBuilderModuleFooter';
import {PageBuilderModuleCreateButton} from './pageBuilderModuleCreateButton';

export class PageBuilderModule extends BaseComponent {
    static defaultSelector = '[jahiatype="module"]';
    parentFrame: BaseComponent;
    path: string;

    hover() {
        this.get().realHover();
        return this.get();
    }

    getBox() {
        return cy.get(`@component${this.parentFrame.id}`)
            .find(`[data-sel-role="page-builder-box"][data-jahia-path="${this.path}"]`);
    }

    assertNoBox() {
        return cy.get(`@component${this.parentFrame.id}`)
            .find(`[data-sel-role="page-builder-box"][data-jahia-path="${this.path}"]`).should('not.exist');
    }

    getBoxStatus(status: string) {
        this.getBox().find(`[data-sel-role="content-status"][data-status-type="${status}"]`).scrollIntoView();
        return this.getBox().find(`[data-sel-role="content-status"][data-status-type="${status}"]`);
    }

    /*
     * Use specifically to check when expected for content to have other statuses displayed (i.e. box element exists)
     * Otherwise use `assertBoxNotExist` when there are no badges displayed
     */
    assertNoBoxStatus(status: string) {
        this.getBox().scrollIntoView();
        return this.getBox().find(`[data-sel-role="content-status"][data-status-type="${status}"]`).should('not.exist');
    }

    getForDeletionStatus() {
        cy.get(`@component${this.parentFrame.id}`)
            .find(`[data-sel-role="infos-deleted"][data-jahia-path="${this.path}"]`)
            .scrollIntoView();
        return cy.get(`@component${this.parentFrame.id}`)
            .find(`[data-sel-role="infos-deleted"][data-jahia-path="${this.path}"]`)
            .find('[data-sel-role="content-status"][data-status-type="markedForDeletion"]');
    }

    hasNoHeaderAndFooter() {
        this.hover();
        this.get().invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="header"][data-jahia-id="${id}"]`).should('not.exist');
            this.parentFrame.get().find(`[jahiatype="footer"][data-jahia-id="${id}"]`).should('not.exist');
        });
    }

    getHeader(selectFirst = false) {
        this.hover();
        if (selectFirst) {
            this.click(); // Header shows up only when selected
        }

        return new PageBuilderModuleHeader(this.getBox().find('[jahiatype="header"]'));
    }

    getFooter() {
        this.hover();
        return new PageBuilderModuleFooter(this.get().invoke('attr', 'id').then(id => {
            return this.parentFrame.get().find(`[jahiatype="footer"][data-jahia-id="${id}"]`);
        }));
    }

    getCreateButtons() {
        return new PageBuilderModuleCreateButton(this.get().find('[jahiatype="module"][type="placeholder"]').invoke('attr', 'id').then(id => {
            return this.parentFrame.get().find(`[jahiatype="createbuttons"][data-jahia-id="${id}"]`);
        }));
    }

    assertHasNoCreateButtons() {
        this.get().find('[jahiatype="module"][type="placeholder"]').invoke('attr', 'id').then(id => {
            return cy.get('iframe[data-sel-role="page-builder-frame-active"]').find(`[jahiatype="createbuttons"][data-jahia-id="${id}"]`).should('not.exist');
        });
    }

    contextMenu(selectFirst = false, force = true): Menu {
        if (selectFirst) {
            this.click();
            this.getHeader().get().should('be.visible').rightclick({force, waitForAnimations: true});
        } else {
            this.hover();
            this.get().rightclick({force, waitForAnimations: true});
        }

        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }

    /* Use specifically for areas with empty content as empty create button takes over content and cannot right-click the regular way */
    emptyAreaContextMenu() {
        this.getHeader().get().rightclick();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }

    click(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().click(clickOptions);
    }

    doubleClick(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().dblclick(clickOptions);
    }

    select() {
        this.get().click({metaKey: true, force: true});
        cy.get('[data-sel-role="selection-infos"]').should('be.visible').and('contain', 'selected');
    }
}
