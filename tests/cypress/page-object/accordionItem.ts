import {Accordion, BaseComponent, Menu, getComponentBySelector} from '@jahia/cypress';
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
        return new TreeItem(this.getSection().find(`[role="treeitem"][data-sel-role=${role}]`), assertion);
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
        return this.get().then(t => {
            const isExpanded = t.attr('aria-expanded') === 'true';
            if (!isExpanded) {
                // Toggle only if not expanded already
                return cy.wrap(t).find('.moonstone-treeView_itemToggle').click();
            }
        });
    }

    contextMenu(): Menu {
        this.get().rightclick();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }
}
