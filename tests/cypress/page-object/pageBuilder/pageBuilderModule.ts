import {BaseComponent, getComponentByAttr, getComponentBySelector, Menu} from '@jahia/cypress';
import ClickOptions = Cypress.ClickOptions;
import {PageBuilderModuleHeader} from './pageBuilderModuleHeader';
import {PageBuilderModuleFooter} from './pageBuilderModuleFooter';
import {PageBuilderModuleCreateButton} from './pageBuilderModuleCreateButton';
import {PageBuilderModuleBox} from './pageBuilderModuleBox';

/**
 * Reports a diagnostic that has to survive a PASSING run.
 *
 * cypress-terminal-report is configured printLogsToConsole/File 'onFail', so a cy.log is discarded
 * on exactly the green runs a retry count is meant to measure. A Node-side task is the only thing
 * that reaches the runner's stdout whatever the outcome — but this file ships in
 * @jahia/jcontent-cypress, and the task it wants lives in the CONSUMER's setupNodeEvents. jContent
 * declares it in cypress.config.common.ts, which `files: ["dist"]` does not publish, so calling it
 * unconditionally fails every consuming repo that never declared it.
 *
 * Hence the opt-in: the config that registers the task is the one that announces it, and everyone
 * else degrades to cy.log. Losing a diagnostic line is the acceptable failure here; failing another
 * team's suite is not.
 */
const logToRunner = (message: string) => {
    if (Cypress.env('jcontentCypressLogTask')) {
        cy.task('log', message);
    } else {
        cy.log(message);
    }
};

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
     * until it times out.
     *
     * `cy.waitUntil` owns the timing on purpose: its budget starts when the queue reaches the
     * command, so the deadline cannot be spent by whatever ran before it.
     *
     * @param timeout total budget in ms before giving up; defaults to the suite's own
     *   defaultCommandTimeout, so this never shrinks a budget a consumer has configured
     * @param interval delay in ms between two hover attempts
     * @param requireHovered also wait for the box to carry `data-box-hovered="true"`. Opt-in, and
     *   only for a caller that then depends on the hover having landed: a box jContent always
     *   displays — an area, a list or an absoluteArea, which Box.jsx renders through
     *   isBarAlwaysDisplayed — needs no hover to exist, so no mouseenter ever fires on it and this
     *   wait could only run out its budget.
     */
    hoverUntilBoxed({timeout = Cypress.config('defaultCommandTimeout'), interval = 250, requireHovered = false} = {}) {
        // Waiting for the hovered state is stronger than waiting for the box: a box also renders
        // when it is selected or status-highlighted (Box.jsx returns null only when none of
        // isHeaderDisplayed / isHovered / isSelected / isStatusHighlighted / isBindableEmpty
        // holds), so "the box is present" does not mean "the hover landed". Stronger is not always
        // reachable though — see requireHovered.
        const boxSelector = `[data-sel-role="page-builder-box"][data-jahia-path="${this.path}"]` +
            (requireHovered ? '[data-box-hovered="true"]' : '');
        let attempts = 0;

        cy.waitUntil(() => {
            attempts++;
            // Caveat, deliberately recorded here rather than only in review: Box.jsx binds
            // mouseenter/mouseleave, which fire only on a real pointer TRANSITION. Re-issuing
            // realHover() at the same coordinates therefore does not always produce a fresh
            // mouseenter — it does when the DOM under the cursor changed in between (the overlay
            // mounting late is exactly that case), but it is not a guaranteed re-trigger.
            // Guaranteeing it would mean moving the pointer away and back, which risks hovering a
            // neighbouring box and mutating the state under test.
            this.get().realHover();
            // JQuery's find() is synchronous and yields an empty set instead of retrying and then
            // failing, which is what lets waitUntil see a plain boolean.
            return this.parentFrame.get().then($frame => $frame.find(boxSelector).length > 0);
        }, {
            timeout,
            interval,
            errorMsg: requireHovered ?
                `Page-builder box for "${this.path}" never reached data-box-hovered="true". The ` +
                    'module itself is rendered, but jContent did not register the hover on it.' :
                `Page-builder box never appeared for "${this.path}". The module itself is ` +
                    'rendered, but jContent did not box it.'
        }).then(() => {
            // Silent when the box was already there, loud when it was not. A retry loop that
            // absorbs a degrading overlay in silence would hide the very latency it works around,
            // so make every extra attempt visible in the run log instead. See logToRunner for why
            // this does not reach for cy.task directly.
            if (attempts > 1) {
                logToRunner(`hoverUntilBoxed: box for "${this.path}" only appeared on attempt ${attempts}`);
            }
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
        // Require the hovered state exactly where the next line asserts it anyway. Demanding it for
        // every caller deadlocks the always-displayed boxes (area / list / absoluteArea), which are
        // boxed without any hover and so never carry the attribute.
        this.hoverUntilBoxed({requireHovered: selectFirst});
        if (selectFirst) {
            // Hovered state is only for unselected modules; this fails if the module is already selected
            this.getBox().assertIsHovered();
            this.click(); // Header shows up only when selected
        }

        // See waitUntilStable's doc: a click grows the box for its header, which can otherwise
        // pin the header over a stale, pre-reflow position for the space of one 50ms poll tick.
        return this.getBox().waitUntilStable().getHeader();
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
