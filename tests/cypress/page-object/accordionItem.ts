import {Accordion, BaseComponent, getComponentBySelector} from '@jahia/cypress';
import {JContentMenu} from './jcontentMenu';
import ClickOptions = Cypress.ClickOptions;

export class AccordionItem {
    accordion: Accordion;
    itemName: string;

    /**
     * @param accordion
     * @param itemName - match accordion header aria-controls attribute value
     */
    constructor(accordion: Accordion, itemName: string) {
        this.accordion = accordion;
        accordion.should('exist');
        this.itemName = itemName;
    }

    getHeader(options?) {
        return this.accordion.get().find(`section.moonstone-accordionItem header[aria-controls="${this.itemName}"]`, options);
    }

    shouldNotExist() {
        return this.getHeader({timeout: 3000}).should('not.exist');
    }

    click() {
        this.accordion.click(this.itemName);
        return this;
    }

    getSection() {
        return this.getHeader().parent('section');
    }

    getTree() {
        return this.getSection().find('[role="tree"]');
    }

    getTreeItems() {
        return this.getSection().find('[role="treeitem"]');
    }

    getTreeItem(role: string, assertion?: (s: JQuery) => void): TreeItem {
        return new TreeItem(this.getSection().find(`[role="treeitem"][data-sel-role="${role}"]`), assertion);
    }

    shouldNotHaveTreeItem(role: string) {
        this.getSection().find(`[role="treeitem"][data-sel-role=${role}]`).should('not.exist');
    }

    expandTreeItem(role: string) {
        this.getTreeItem(role).expand();
    }
}

export class TreeItem extends BaseComponent {
    static defaultSelector = '[role="treeitem"]';

    shouldBeSelected() {
        this.get().find('div').should('have.class', 'moonstone-selected');
    }

    click(options?: Partial<ClickOptions>) {
        return this.get().click(options);
    }

    expand() {
        this.toggle(true);
    }

    collapse() {
        this.toggle(false);
    }

    toggle(expand: boolean) {
        return this.get().then(t => {
            const isExpanded = t.attr('aria-expanded') === 'true';
            if (isExpanded !== expand) {
                return cy.wrap(t).find('.moonstone-treeView_itemToggle').click();
            }
        });
    }

    contextMenu(): JContentMenu {
        this.get().rightclick();
        // Park the cursor away from the menu after opening it. On CI the real
        // mouse position can coincide with where the menu renders, leaving an
        // item pre-hovered so that a subsequent realHover() fires no mouseenter.
        cy.get('body').realHover({position: 'topLeft'});
        return getComponentBySelector(JContentMenu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }
}
