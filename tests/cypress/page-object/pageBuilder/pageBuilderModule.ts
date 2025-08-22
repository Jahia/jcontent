import {BaseComponent, getComponentByAttr, getComponentBySelector, Menu} from '@jahia/cypress';
import ClickOptions = Cypress.ClickOptions;
import {PageBuilderModuleHeader} from './pageBuilderModuleHeader';
import {PageBuilderModuleFooter} from './pageBuilderModuleFooter';
import {PageBuilderModuleCreateButton} from './pageBuilderModuleCreateButton';
import {PageBuilderModuleBox} from './pageBuilderModuleBox';

export class PageBuilderModule extends BaseComponent {
    static defaultSelector = '[jahiatype="module"]';
    parentFrame: BaseComponent;
    path: string;

    hover() {
        this.get().realHover();
        return this.get();
    }

    getBox(): PageBuilderModuleBox {
        return getComponentByAttr(PageBuilderModuleBox, 'data-jahia-path', this.path, this.parentFrame);
    }

    assertNoBox() {
        return cy.get(`@component${this.parentFrame.id}`)
            .find(`[data-sel-role="page-builder-box"][data-jahia-path="${this.path}"]`).should('not.exist');
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

    getHeader(selectFirst = false): PageBuilderModuleHeader {
        this.hover();
        if (selectFirst) {
            // Hovered state is only for unselected modules; this fails if the module is already selected
            this.getBox().assertIsHovered();
            this.click(); // Header shows up only when selected
        }

        return this.getBox().getHeader();
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
            this.getHeader(selectFirst).get()
                .should('be.visible')
                .rightclick({force, waitForAnimations: true});
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

    /**
     * Clicks on the module, optionally with click options.
     * If click is meant to unselect or unclick the module, assertSelected or assertClicked needs to be set to false; assertion defaults to true.
     * @param clickOptions
     */
    click(clickOptions?: Partial<ClickOptions> & {assertSelected?: boolean, assertClicked?: boolean}): void {
        this.get().scrollIntoView();
        this.get().click(clickOptions);
        if (clickOptions?.metaKey) {
            const assertSelected = (clickOptions && Object.prototype.hasOwnProperty.call(clickOptions, 'assertSelected')) ? clickOptions.assertSelected : true;
            if (assertSelected) {
                this.getBox().assertIsSelected();
            }
        } else {
            const assertClicked = (clickOptions && Object.prototype.hasOwnProperty.call(clickOptions, 'assertClicked')) ? clickOptions.assertClicked : true;
            if (assertClicked) {
                this.getBox().assertIsClicked();
            }
        }
    }

    unclick(clickOptions?: Partial<ClickOptions>) {
        this.click({...clickOptions, assertClicked: false, assertSelected: false});
    }

    doubleClick(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView();
        this.get().dblclick(clickOptions);
    }

    select() {
        this.click({metaKey: true, force: true});
        cy.get('[data-sel-role="selection-infos"]').should('be.visible').and('contain', 'selected');
    }

    unselect() {
        this.unclick({metaKey: true, force: true});
    }
}
