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
    getElement,
    Menu,
    SecondaryNav,
    TableRow
} from '@jahia/cypress';
import {BasicSearch} from './basicSearch';
import {CreateContent} from './createContent';
import {ContentEditor} from './contentEditor';
import {Media} from './media';
import {ContentTable} from './contentTable';
import {AccordionItem} from './accordionItem';
import {ContentGrid} from './contentGrid';
import {BreadcrumbPageBuilder} from './breadcrumb';
import ClickOptions = Cypress.ClickOptions;
import VisitOptions = Cypress.VisitOptions;

export class JContent extends BasePage {
    secondaryNav: SecondaryNav;
    accordion: Accordion;
    siteSwitcher: Dropdown;
    languageSwitcher: Dropdown;

    static visit(site: string, language: string, path: string, visitOptions: Partial<VisitOptions> = {}): JContent {
        cy.visit(`/jahia/jcontent/${site}/${language}/${path}`, visitOptions);
        return new JContent();
    }

    reset() {
        this.secondaryNav = null;
        this.accordion = null;
        this.siteSwitcher = null;
        this.languageSwitcher = null;
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

    createContent(contentType: string): ContentEditor {
        return this.getCreateContent()
            .open()
            .getContentTypeSelector()
            .searchForContentType(contentType)
            .selectContentType(contentType)
            .create();
    }

    editComponentByText(text: string) {
        const row = new TableRow(getElement(TableRow.defaultSelector, this.getTable()).contains(text));
        row.get().scrollIntoView();
        row.contextMenu().select('Edit');
        return new ContentEditor();
    }

    editPage() {
        cy.get('[data-sel-role="editPage"]').click();
        return new ContentEditor();
    }

    viewSubContentComponentByText(text: string) {
        const row = new TableRow(getElement(TableRow.defaultSelector, this.getTable()).contains(text));
        row.get().scrollIntoView();
        row.contextMenu().select('View sub-contents');
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

    getGrid(): ContentGrid {
        return getComponent(ContentGrid, null, el => expect(el).to.be.visible);
    }

    getBasicSearch(): BasicSearch {
        return new BasicSearch(this);
    }

    getCreateContent(): CreateContent {
        return new CreateContent(this);
    }

    getMedia(): Media {
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
        const dropdown = getComponentByRole(Dropdown, 'sel-view-mode-dropdown');
        // Wait for dropdown to be available
        dropdown.get().find('[role=dropdown]:not(.moonstone-disabled)');
        dropdown.select(name).get().should('contain', name);
        return this;
    }

    shouldBeInMode(name: string): void {
        const dropdown = getComponentByRole(Dropdown, 'sel-view-mode-dropdown');
        dropdown.get().should('contain', name);
    }

    switchToThumbnails(): JContent {
        this.switchToMode('Thumbnails');
        return this;
    }

    switchToListMode(): JContent {
        this.switchToMode('List');
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
        return this;
    }

    switchToStructuredView(): JContent {
        this.switchToMode('Structured');
        return this;
    }

    switchToPageBuilder(): JContentPageBuilder {
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
        this.switchToMode('Page Builder - Beta');
        return new JContentPageBuilder(this);
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

    checkSelectionCount(count: number): void {
        if (count === 0) {
            cy.get('[data-sel-role="selection-infos"]', {timeout: 5000}).should('not.exist');
        } else {
            cy.get('[data-sel-role="selection-infos"]')
                .should('have.attr', 'data-sel-selection-size')
                .and('equal', count.toString());
        }
    }

    getHeaderActionButton(role: string): Button {
        return getComponentBySelector(Button, `.moonstone-header button[data-sel-role="${role}"]`);
    }

    clickPublishNow() {
        cy.get('#publishNowButton').should('be.visible').find('button').contains('Publish now').click();
    }
}

export class JContentPageBuilder extends JContent {
    private alias: string;

    constructor(base: JContent, alias = 'pcIframe') {
        super();
        this.alias = alias;
        Object.assign(this, base);
    }

    iframe(bypassCheck = false) {
        const iframeSel = '[data-sel-role="page-builder-frame-active"]';
        cy.iframe(iframeSel).as(this.alias);
        if (!bypassCheck) {
            cy.get(`@${this.alias}`).find('[jahiatype="createbuttons"]');
        }

        return new BaseComponent(cy.get(`@${this.alias}`));
    }

    getCreatePage(): void {
        cy.get('.moonstone-header button[data-sel-role="jnt:page"]').click();
    }

    getModule(path: string): PageBuilderModule {
        const parentFrame = this.iframe();
        const module = getComponentBySelector(PageBuilderModule, `[jahiatype="module"][path="${path}"]`, parentFrame);
        module.should('exist').and('be.visible');
        module.parentFrame = parentFrame;
        return module;
    }

    getMainModule(path: string): PageBuilderModule {
        const parentFrame = this.iframe(true);
        const module = getComponentBySelector(PageBuilderModule, `[jahiatype="mainmodule"][path="${path}"]`, parentFrame);
        module.should('exist').and('be.visible');
        module.parentFrame = parentFrame;
        return module;
    }

    refresh(): JContentPageBuilder {
        cy.get('[data-sel-role="page-builder-frame-active"]').invoke('attr', 'id').then(() => {
            cy.get('.moonstone-header button[data-sel-role="refresh"]').click();
            // Cy.get('[data-sel-role="page-builder-frame-active"]').should(e => {
            //     expect(previousId).to.not.eq(e[0].getAttribute('id'));
            // });
        });
        return this;
    }

    clickPublishNow() {
        cy.get('#publishNowButton').should('be.visible')
            .find('button').contains('Publish now')
            .click();
    }
}

class PageBuilderModuleHeader extends BaseComponent {
    static defaultSelector = '[jahiatype="header"]';

    assertStatus(value: string) {
        this.get().find('[data-sel-role="content-status"]').contains(value);
    }

    getButton(role: string): Button {
        return getComponentByRole(Button, role, this);
    }

    assertHeaderText(text: string) {
        this.get().find('p').contains(text);
    }

    select() {
        this.get().find('[data-sel-role="selection-checkbox"]').click();
    }
}

class PageBuilderModuleFooter extends BaseComponent {
    static defaultSelector = '[jahiatype="footer"]';

    getBreadcrumbs(): BreadcrumbPageBuilder {
        return getComponentByRole(BreadcrumbPageBuilder, 'pagebuilder-breadcrumb', this);
    }
}

class PageBuilderModuleCreateButton extends BaseComponent {
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

class PageBuilderModule extends BaseComponent {
    static defaultSelector = '[jahiatype="module"]';
    parentFrame: BaseComponent;

    hover() {
        this.get().realHover();
        return this.get();
    }

    hasNoHeaderAndFooter() {
        this.hover();
        this.get().invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="header"][data-jahia-id="${id}"]`).should('not.exist');
            this.parentFrame.get().find(`[jahiatype="footer"][data-jahia-id="${id}"]`).should('not.exist');
        });
    }

    getHeader(selectFirst = false) {
        this.hover();
        if (selectFirst) {
            this.click(); // Header shows up only when selected
        }

        this.get().invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="header"][data-jahia-id="${id}"]`);
        });
        return getComponent(PageBuilderModuleHeader, this.parentFrame);
    }

    getFooter() {
        this.hover();
        this.get().invoke('attr', 'id').then(id => {
            this.parentFrame.get().find(`[jahiatype="footer"][data-jahia-id="${id}"]`);
        });
        return getComponent(PageBuilderModuleFooter, this.parentFrame);
    }

    getCreateButtons() {
        return new PageBuilderModuleCreateButton(this.get().find('[jahiatype="module"][type="placeholder"]').invoke('attr', 'id').then(id => {
            return this.parentFrame.get().find(`[jahiatype="createbuttons"][data-jahia-id="${id}"]`);
        }));
    }

    contextMenu(selectFirst = false, force = true): Menu {
        this.getHeader(selectFirst);
        this.get().rightclick({force});
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }

    click(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().click(clickOptions);
    }

    doubleClick(clickOptions?: Partial<ClickOptions>) {
        this.get().scrollIntoView().dblclick(clickOptions);
    }
}
