import {BaseComponent, getComponentByAttr, getComponentBySelector, Menu} from '@jahia/cypress';
import ClickOptions = Cypress.ClickOptions;
import {PageBuilderModuleHeader} from './pageBuilderModuleHeader';
import {PageBuilderModuleFooter} from './pageBuilderModuleFooter';
import {PageBuilderModuleCreateButton} from './pageBuilderModuleCreateButton';
import {PageBuilderModuleBox} from "./pageBuilderModuleBox";

export class PageBuilderModule extends BaseComponent {
    static defaultSelector = '[jahiatype="module"]';
    parentFrame: BaseComponent;
    path: string;

    hover() {
        this.get().realHover();
        this.getBox().assertIsHovered();
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

    click(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().click(clickOptions);
        this.getBox().assertIsClicked();
    }

    doubleClick(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().dblclick(clickOptions);
    }

    select() {
        this.get().click({metaKey: true, force: true});
        cy.get('[data-sel-role="selection-infos"]').should('be.visible').and('contain', 'selected');
    }
}
