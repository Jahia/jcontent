import {
    Accordion,
    BaseComponent,
    BasePage,
    Button,
    Dropdown,
    getComponent,
    getComponentByAttr,
    getComponentByRole,
    getComponentBySelector,
    Menu,
    SecondaryNav
} from '@jahia/cypress';
import {BasicSearch} from './basicSearch';
import {CreateContent} from './createContent';
import {Media} from './media';
import {ContentTable} from './contentTable';
import {AccordionItem} from './accordionItem';

export class JContent extends BasePage {
    secondaryNav: SecondaryNav;
    accordion: Accordion;
    siteSwitcher: Dropdown;
    languageSwitcher: Dropdown;

    static visit(site: string, language: string, path: string): JContent {
        cy.visit(`/jahia/jcontent/${site}/${language}/${path}`);
        return new JContent();
    }

    static visitCatMan(language: string): CategoryManager {
        cy.visit(`/jahia/catMan/${language}/category/`);
        return new CategoryManager(new JContent());
    }

    getSecondaryNav(): SecondaryNav {
        if (!this.secondaryNav) {
            this.secondaryNav = getComponent(SecondaryNav);
        }

        return this.secondaryNav;
    }

    getSecondaryNavAccordion(): Accordion {
        if (!this.accordion) {
            this.accordion = getComponent(Accordion, this.getSecondaryNav());
        }

        return this.accordion;
    }

    getAccordionItem(itemName: string): AccordionItem {
        return new AccordionItem(this.getSecondaryNavAccordion(), itemName);
    }

    getSiteSwitcher(): Dropdown {
        if (!this.siteSwitcher) {
            this.siteSwitcher = getComponentByAttr(Dropdown, 'data-cm-role', 'site-switcher');
        }

        return this.siteSwitcher;
    }

    getLanguageSwitcher(): Dropdown {
        if (!this.languageSwitcher) {
            this.languageSwitcher = getComponentByAttr(Dropdown, 'data-cm-role', 'language-switcher');
        }

        return this.languageSwitcher;
    }

    getTable(): ContentTable {
        return getComponent(ContentTable, null, el => expect(el).to.be.visible);
    }

    getBasicSearch(): BasicSearch {
        return new BasicSearch(this);
    }

    getCreateContent(): CreateContent {
        return new CreateContent(this);
    }

    getMedia() : Media {
        return new Media(this);
    }

    selectAccordion(accordion: string): JContent {
        this.getSecondaryNavAccordion().click(accordion);
        return this;
    }

    switchToSubpages(): JContent {
        cy.get('button[data-cm-view-type="pages"]')
            .should('contain', '(')// Need to wait until data is loaded i.e. count is visible
            .click({force: true});
        return this;
    }

    switchToMode(name: string): JContent {
        getComponentByRole(Dropdown, 'sel-view-mode-dropdown').select(name).get().should('contain', name);
        return this;
    }

    switchToGridMode(): JContent {
        this.switchToMode('grid');
        return this;
    }

    switchToListMode(): JContent {
        this.switchToMode('List');
        return this;
    }

    switchToFlatList(): JContent {
        this.switchToMode('flatList');
        return this;
    }

    switchToStructuredView(): JContent {
        this.switchToMode('structuredView');
        return this;
    }

    switchToPageComposer(): JContentPageComposer {
        this.switchToMode('Page Composer');
        return new JContentPageComposer(this);
    }

    assertStatus(value: string) {
        cy.get('.moonstone-header [data-sel-role="content-status"]').contains(value);
    }

    clearClipboard(): JContent {
        cy.get('.moonstone-header button[data-sel-role="clearClipboard"]').click();
        return this;
    }

    getSelectionDropdown(): Dropdown {
        return getComponentByRole(Dropdown, 'selection-infos');
    }

    clearSelection(): JContent {
        cy.get('.moonstone-header button[data-sel-role="clearSelection"]').click();
        return this;
    }

    rightClickMenu(operation: string, elementName: string) {
        cy.get('td[data-cm-role="table-content-list-cell-name"]').contains(elementName).rightclick();
        return cy.get('menu[data-sel-role="jcontent-contentMenu"]:not([class*="moonstone-hidden"]').find(`li[data-sel-role="${operation}"]`).click();
    }

    paste() {
        return cy.get('span:contains("Paste"):not(:contains("Paste "))').click();
    }

    checkUserCanNotPaste() {
        cy.get('span:contains("Paste"):not(:contains("Pasteur"))').should('have.length', 0);
    }

    checkUserCanNotCut(elementName: string) {
        cy.get('td[data-cm-role="table-content-list-cell-name"]').contains(elementName).rightclick();
        cy.get('menu[data-sel-role="jcontent-contentMenu"]:not([class*="moonstone-hidden"]').find('li[data-sel-role="cut"]').should('not.exist');
    }
}

export class JContentPageComposer extends JContent {
    constructor(base: JContent) {
        super();
        Object.assign(this, base);
    }

    iframe() {
        const iframeSel = '[data-sel-role="page-composer-frame-active"]';
        cy.iframe(iframeSel).as('pcIframe');
        cy.get('@pcIframe').find('[jahiatype="createbuttons"]');
        return new BaseComponent(cy.get('@pcIframe'));
    }

    getCreatePage(): void {
        cy.get('.moonstone-header button[data-sel-role="jnt:page"]').click();
    }

    getModule(path: string): PageComposerModule {
        const parentFrame = this.iframe();
        const module = getComponentBySelector(PageComposerModule, `[jahiatype="module"][path="${path}"]`, parentFrame);
        module.parentFrame = parentFrame;
        return module;
    }

    refresh(): JContentPageComposer {
        cy.get('[data-sel-role="page-composer-frame-active"]').invoke('attr', 'id').then(() => {
            cy.get('.moonstone-header button[data-sel-role="refresh"]').click();
            // Cy.get('[data-sel-role="page-composer-frame-active"]').should(e => {
            //     expect(previousId).to.not.eq(e[0].getAttribute('id'));
            // });
        });
        return this;
    }
}

class PageComposerModuleHeader extends BaseComponent {
    static defaultSelector = '[jahiatype="header"]';

    assertStatus(value: string) {
        this.get().find('[data-sel-role="content-status"]').contains(value);
    }

    getButton(role: string): Button {
        return getComponentByRole(Button, role, this);
    }
}

class PageComposerModuleCreateButton extends BaseComponent {
    static defaultSelector = '[jahiatype="createbuttons"]';

    getButton(type: string): Button {
        return new Button(this.get().find('.moonstone-button').contains(type));
    }

    assertHasNoButton(): void {
        this.get().find('.moonstone-button').should('not.exist');
    }

    assertHasNoButtonForType(type: string): void {
        this.get().find('.moonstone-button').contains(type).should('not.exist');
    }
}

class PageComposerModule extends BaseComponent {
    static defaultSelector = '[jahiatype="module"]';
    parentFrame: BaseComponent;

    hover() {
        this.get().realHover();
    }

    getHeader() {
        this.hover();
        this.get().invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="header"][data-jahia-id="${id}"]`);
        });
        return getComponent(PageComposerModuleHeader, this.parentFrame);
    }

    getCreateButtons() {
        return new PageComposerModuleCreateButton(this.get().find('[jahiatype="module"][type="placeholder"]').invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="createbuttons"][data-jahia-id="${id}"]`);
        }));
    }

    contextMenu(): Menu {
        this.getHeader();
        this.get().rightclick({force: true});
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }

    click(clickOptions?) {
        this.get().scrollIntoView().click(clickOptions);
    }
}

export class CategoryManager extends JContent {
    constructor(base: JContent) {
        super();
        Object.assign(this, base);
    }

    getCreateCategory(): void {
        cy.get('.moonstone-header button[data-sel-role="jnt:category"]').click();
    }
}
