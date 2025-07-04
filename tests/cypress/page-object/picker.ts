import {
    Accordion,
    BaseComponent,
    Button,
    Dropdown,
    getComponent,
    getComponentByAttr,
    getComponentByRole,
    getComponentBySelector,
    SecondaryNav,
    Table
} from '@jahia/cypress';
import {PageComposer} from './pageComposer';
import {AccordionItem} from './accordionItem';
import {PickerTable} from './pickerTable';
import {PickerGrid} from './pickerGrid';

export class Picker extends BaseComponent {
    pageComposer: PageComposer;
    siteSwitcher: Dropdown;

    secondaryNav: SecondaryNav;
    accordion: Accordion;
    table: PickerTable;
    selectionTable: Table;
    viewMode: Dropdown;
    grid: PickerGrid;

    getSiteSwitcher() {
        if (!this.siteSwitcher) {
            this.siteSwitcher = getComponentByAttr(Dropdown, 'data-cm-role', 'site-switcher', this);
        }

        // Make sure dialog is open before returning siteSwitcher
        return this && this.siteSwitcher;
    }

    getViewMode() {
        if (!this.viewMode) {
            this.viewMode = getComponentByAttr(Dropdown, 'data-sel-role', 'sel-view-mode-dropdown', this);
        }

        // Make sure dialog is open before returning viewMode
        return this && this.viewMode;
    }

    getRefreshButton() {
        return getComponentByRole(Button, 'refresh', this);
    }

    getAccordion(): Accordion {
        if (!this.accordion) {
            const secondaryNav = getComponent(SecondaryNav);
            this.accordion = getComponent(Accordion, secondaryNav);
        }

        return this.accordion;
    }

    assertHasNoTree(): void {
        this.get().find(`${SecondaryNav.defaultSelector}`).should('not.exist');
    }

    assertHasNoTable(): void {
        this.get().find(`${PickerTable.defaultSelector}[data-cm-role=table-content-list]`).should('not.exist');
    }

    assertHasNoSiteSwitcher(): void {
        this.get().find(`${PickerTable.defaultSelector}[data-cm-role=site-switcher]`).should('not.exist');
    }

    assertHasNoDisplaySearch(): void {
        this.get().find(`${PickerTable.defaultSelector}[role=search]`).should('not.exist');
    }

    /**
     * @param itemName -
     */
    getAccordionItem(itemName: string) {
        return new AccordionItem(this.getAccordion(), itemName);
    }

    cancel() {
        getComponentByAttr(Button, 'data-sel-picker-dialog-action', 'cancel').click(); // Cancel picker
    }

    select() {
        getComponentByAttr(Button, 'data-sel-picker-dialog-action', 'done').click(); // Select picker selection
    }

    getTable() {
        if (!this.table) {
            this.table = getComponentByAttr(PickerTable, 'data-cm-role', 'table-content-list', this);
        }

        this.wait();
        return this.table;
    }

    getSelectionTable() {
        if (!this.selectionTable) {
            this.selectionTable = getComponentByAttr(Table, 'data-cm-role', 'selection-table', this);
            this.selectionTable.get().find('.moonstone-TableRow').should('be.visible');
        }

        return this.selectionTable;
    }

    wait(millis?: number) {
        if (millis) {
            cy.wait(millis);
        } else {
            cy.get('.moonstone-loader').should('not.exist'); // Wait to load
        }
    }

    navigateTo(accordion: AccordionItem, path: string) {
        const expandPaths = path.split('/');
        const [selectPath] = expandPaths.splice(expandPaths.length - 1, 1);
        expandPaths.forEach(p => accordion.expandTreeItem(p));
        accordion.getTreeItem(selectPath).click();
        this.wait();
        accordion.getTreeItem(selectPath).shouldBeSelected();
    }

    // @deprecated use table functions directly
    getTableRow(name: string) {
        return this.getTable().getRowByLabel(name);
    }

    getSelectionCaption() {
        return this.get().find('[data-cm-role="selection-caption"] [data-sel-role$="item-selected"]');
    }

    getTab(viewType: string) {
        return this.get().find(`.moonstone-tabItem[data-cm-view-type="${viewType}"]`);
    }

    selectTab(viewType: string) {
        this.getTab(viewType).then($tab => {
            if (!$tab.hasClass('moonstone-tabItem_selected')) {
                cy.wrap($tab).click();
                cy.wrap($tab).should('have.class', 'moonstone-tabItem_selected');
            }
        });
        this.wait();
    }

    search(query?: string, expectNoResult = false) {
        if (query === undefined) {
            this.get().find('input[role="searchbox"]').should('be.visible').click().clear({waitForAnimations: true});
            this.table = undefined;
            this.selectionTable = undefined;
            this.get().find('[data-cm-role="table-content-list"]').find('.moonstone-TableRow').should('be.visible');
        } else {
            this.get().find('input[role="searchbox"]')
                .should('be.visible')
                .click()
                .type(query, {waitForAnimations: true, delay: 200});
            this.table = undefined;
            this.selectionTable = undefined;
            if (!expectNoResult) {
                this.get().find('[data-cm-role="table-content-list"]').find('.moonstone-TableRow').should('be.visible');
            }
        }

        this.wait();
    }

    getSearchInput() {
        return this.get().find('input[role="searchbox"]').should('be.visible');
    }

    getResults() {
        return this.get().find('[data-sel-role="table-pagination-total-rows"]');
    }

    verifyResultsLength(length: number) {
        this.getResults().should('be.visible').and('contain', `of ${length}`);
    }

    verifyResultsAtLeast(length: number) {
        const totalRowsSelector = '[data-sel-role="table-pagination-total-rows"]';
        this.get().find(totalRowsSelector).should('be.visible');
        this.get().find(totalRowsSelector)
            .invoke('text')
            .then(e => {
                // Get total rows through regex e.g. extract 21 from "1-21 of 21"
                const totalRows = e.match(/of (.*)$/)?.[1];
                const totalRowsNum = Number(totalRows);
                expect(totalRowsNum).to.be.at.least(length, `Verifying picker result rows to at least be ${length}`);
            });
    }

    switchSearchContext(context: string) {
        getComponentBySelector(Dropdown, '.moonstone-searchContextInput_element').select(context);
    }

    verifyResultsAreEmpty() {
        this.get().should('contain.text', 'No matches found').and('contain.text', 'No results for your search');
    }

    refreshComponents() {
        this.table = undefined;
        this.selectionTable = undefined;
    }

    switchToSite(site: string) {
        this.getSiteSwitcher().select(site);
        this.refreshComponents();
    }

    switchViewMode(viewMode: string) {
        this.getViewMode().select(viewMode);
        this.wait();
    }

    getGrid() {
        if (!this.grid) {
            this.grid = getComponentByAttr(PickerGrid, 'data-cm-role', 'grid-content-list', this);
        }

        this.wait();
        return this.grid;
    }

    uploadFile(pathToFixture: string) {
        this.get().find('table[data-cm-role="table-content-list"]')
            .selectFile(pathToFixture, {
                action: 'drag-drop',
                waitForAnimations: true
            });
    }
}
