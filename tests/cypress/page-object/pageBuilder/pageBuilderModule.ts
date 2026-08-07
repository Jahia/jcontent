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

    /**
     * Hovers this module until jContent has drawn its page-builder box, re-firing the hover on
     * every attempt.
     *
     * `realHover()` dispatches a single mouseover, and Cypress retry-ability replays the last
     * *query* of a chain, never the *actions* that precede it. So a hover landing before the
     * EditFrame overlay has attached its listeners to a freshly (re)loaded iframe is a
     * permanently lost event, not a slow one: the downstream `getBox()` can then only sit there
     * until it times out. Re-hovering is the only thing that recovers it.
     *
     * @param timeout total budget in ms before giving up; defaults to the suite's own
     *   defaultCommandTimeout, so this never shrinks a budget a consumer has configured
     * @param interval delay in ms between two hover attempts
     * @param requireHovered also wait for the box to carry `data-box-hovered="true"`
     */
    hoverUntilBoxed({timeout = Cypress.config('defaultCommandTimeout'), interval = 250, requireHovered = false} = {}) {
        const boxSelector = `[data-sel-role="page-builder-box"][data-jahia-path="${this.path}"]` +
            (requireHovered ? '[data-box-hovered="true"]' : '');

        // Start the clock when the queue REACHES this command, not when the test body enqueues it.
        // A test body runs to completion before the first command executes, so a deadline computed
        // here at enqueue time would already be spent by everything that ran in between.
        cy.then(() => {
            const started = Date.now();
            let attempts = 0;

            const attempt = () => {
                attempts++;
                this.get().realHover();
                // JQuery's find() is synchronous and yields an empty set instead of retrying and then
                // failing, which is what makes the outcome branchable — cy.find() could not be used here.
                return this.parentFrame.get().then($frame => {
                    if ($frame.find(boxSelector).length > 0) {
                        return;
                    }

                    const elapsed = Date.now() - started;
                    if (elapsed > timeout) {
                        throw new Error(
                            `Page-builder box${requireHovered ? ' with data-box-hovered="true"' : ''} never appeared ` +
                            `for "${this.path}" after ${attempts} hover attempts over ${elapsed}ms. ` +
                            'The module itself is rendered, but jContent did not box it.'
                        );
                    }

                    // eslint-disable-next-line cypress/no-unnecessary-waiting
                    return cy.wait(interval).then(() => attempt());
                });
            };

            return attempt();
        });

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
        this.hoverUntilBoxed({requireHovered: selectFirst});
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

    getAllCreateButtons() {
        return new PageBuilderModuleCreateButton(
            this.getBox().getHeader().get().invoke('attr', 'data-jahia-id').then(id => {
                return this.parentFrame.get().find(`[jahiatype="createbuttons"][data-jahia-parent="${id}"]`).filter(':visible');
            })
        );
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
