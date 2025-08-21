import {
    Accordion, BaseComponent,
    BasePage,
    Button,
    Dropdown,
    getComponent,
    getComponentByAttr,
    getComponentByRole,
    getComponentBySelector,
    getComponentByContent,
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
import {CompareDialog} from './compareDialog';
import {PageBuilderHeaders, PageBuilderModule} from './pageBuilder';
import VisitOptions = Cypress.VisitOptions;
import {ContentStatusSelector} from './contentStatusSelector';
import {ContentStatus} from './contentStatus';

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
        // Since we added content type to html annotations, try those first
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

    getCreatePage(): void {
        cy.get('.moonstone-header button[data-sel-role="jnt:page"]').click();
    }

    editPage() {
        cy.get('[data-sel-role="editPage"]').click();
        return new ContentEditor();
    }

    editContent() {
        cy.get('header [data-sel-role="edit"]').click();
        return new ContentEditor();
    }

    getBrowseControlMenu(): Menu {
        getComponentByRole(Button, 'browseControlBarMenu').click();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }

    import(filename:string) {
        getComponentByRole(Button, 'browseControlBarMenu').click();
        cy.get('li[data-sel-role="import"]').should('exist').and('be.visible').click();
        cy.get('#file-upload-input').selectFile(filename, {force: true});
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

    getStatusSelector(): ContentStatusSelector {
        return getComponent(ContentStatusSelector);
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
        dropdown.get().find('[role=listbox]:not(.moonstone-disabled)');
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
        this.switchToMode('Page Builder');
        return new JContentPageBuilder(this);
    }

    getHeader() {
        return getComponentBySelector(BaseComponent, '.moonstone-header');
    }

    assertStatus(value: string) {
        getComponentByContent(ContentStatus, value, this.getHeader());
    }

    assertStatusType(value: string) {
        getComponentByAttr(ContentStatus, 'data-status-type', value, this.getHeader()).should('be.visible');
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

    assertHeaderActionSelected(role: string) {
        this.getHeaderActionButton(role).should('have.class', 'moonstone-tabItem_selected');
    }

    publish() {
        cy.get('[data-sel-role="publish"]').click();
        this.clickPublishNow();
    }

    publishAll() {
        cy.get('[data-sel-role="publishAll"]').click();
        this.clickPublishNow();
        cy.get('div[id="notistack-snackbar"]', {timeout: 5000})
            .contains('Publication completed', {timeout: 5000})
            .should('be.visible');
    }

    clickPublishNow() {
        cy.get('#publishNowButton').should('be.visible')
            .find('button').contains('Publish now')
            .click();
    }

    getCompareDialog(): CompareDialog {
        return getComponent(CompareDialog);
    }

    openContextMenuByRowName(rowName: string) {
        return this.getTable()
            .getRowByName(rowName) // Already scrolls to view
            .contextMenu();
    }
}

export class JContentPageBuilder extends JContent {
    private readonly alias: string;

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

    getModule(path: string, bypassFrameLoadedCheck = true): PageBuilderModule {
        const parentFrame = this.iframe(bypassFrameLoadedCheck);
        // I see cypress querying the module even before iFrame has settled and verified.
        // Force a wait here to settle the iframe first before continuing
        cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        const module = getComponentBySelector(PageBuilderModule, `[jahiatype="module"][path="${path}"]`, parentFrame);
        module.should('exist').and('be.visible');
        module.parentFrame = parentFrame;
        module.path = path;
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

    getPageHeaderList(): PageBuilderHeaders {
        return getComponentByRole(PageBuilderHeaders, 'page-header-list');
    }
}

