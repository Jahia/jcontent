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

    /**
     * Waits until this box's on-screen position (its inline top/left/width/height style) stops
     * changing.
     *
     * jContent tracks each box's position by resyncing an absolutely-positioned overlay from the
     * real iframe DOM (EditFrame.jsx's addIntervalCallback), driven by a fixed 50ms setInterval —
     * not an event listener. A reflow elsewhere on the page (e.g. Box.jsx's
     * adaptContentPositionAndSize, a render side effect for area/list boxes that shifts sibling
     * layout) can leave this box's overlay at a stale coordinate for up to that 50ms window. A
     * click is what makes this visible: it grows the box to make room for the header, so a stale
     * offset now carries a pinned header over whatever content actually sits at that coordinate.
     * Requiring two consecutive identical reads a beat apart clears that window before the
     * header is queried or interacted with.
     *
     * @param timeout total budget in ms before giving up
     * @param interval delay in ms between reads; kept above the 50ms poll so two consecutive
     *   equal reads mean a full poll cycle produced no change, not that we got lucky between ticks
     */
    waitUntilStable({timeout = Cypress.config('defaultCommandTimeout'), interval = 60} = {}): PageBuilderModuleBox {
        let lastStyle: string | undefined;
        let stableReads = 0;
        cy.waitUntil(() => this.get().then($box => {
            const style = $box.attr('style');
            stableReads = (style === lastStyle) ? stableReads + 1 : 0;
            lastStyle = style;
            return stableReads >= 2;
        }), {
            timeout,
            interval,
            errorMsg: 'Page-builder box position never stabilized — its inline style (top/left/width/height) kept changing.'
        });
        return this;
    }
}
