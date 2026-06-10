import {Menu} from '@jahia/cypress';

/**
 * Extends the base Menu class with a more reliable submenu() implementation.
 *
 * The base implementation does realHover() then immediately queries for the submenu,
 * which races against React's render cycle. This override:
 *   1. Waits for skeleton items to clear (menu fully loaded) before hovering, since
 *      skeleton items have no onMouseEnter handler and won't open the submenu.
 *   2. Retries realHover() up to 3 times to handle the brief window where the menu
 *      is repositioning after the skeleton→real transition.
 */
export class JContentMenu extends Menu {
    submenu(item: string, menuRole: string): JContentMenu {
        this.get()
            .find('[data-sel-role="menu-item-skeleton"]')
            .should('not.exist');

        Cypress._.times(3, () => {
            this.shouldHaveItem(item);
            this.get()
                .find('.moonstone-menuItem').contains(item)
                .realHover();
        });

        cy.get(
            `${Menu.defaultSelector}[data-sel-role="${menuRole}"]`,
            {timeout: 10000}
        ).should('be.visible');

        return new JContentMenu(
            cy.get(`${Menu.defaultSelector}[data-sel-role="${menuRole}"]`)
        );
    }
}
