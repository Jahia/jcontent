import {JContent} from '../../page-object';
import {getComponentBySelector, Menu} from '@jahia/cypress';

describe('Area actions', () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({
            mutationFile: 'jcontent/createTextContentUnderPath.graphql',
            variables: {path: '/sites/jcontentSite/home'}
        });
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
    });

    it('Checks that delete, copy and cut menu items are not present on areas in page builder', () => {
        const jcontentPageBuilder = jcontent.switchToPageBuilder();
        const header = jcontentPageBuilder.getModule('/sites/jcontentSite/home/landing', false)
            .getHeader(false);
        header.get().click();
        header.getButton('contentItemActionsMenu').click();
        const menu = getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');

        menu.get().find('.moonstone-menuItem[data-sel-role="editAdvanced"]').should('be.visible');
        menu.get().find('.moonstone-menuItem[data-sel-role="delete"]').should('not.exist');
        menu.get().find('.moonstone-menuItem[data-sel-role="copy"]').should('not.exist');
        menu.get().find('.moonstone-menuItem[data-sel-role="cut"]').should('not.exist');
        menu.get().find('.moonstone-menuItem[data-sel-role="edit"]').should('not.exist');
    });

    it('Checks that content can be pasted into the area', () => {
        const jcontentPageBuilder = jcontent.switchToPageBuilder();
        jcontentPageBuilder.getModule('/sites/jcontentSite/home/landing/test-content-path2', false)
            .contextMenu(false, false)
            .selectByRole('copy');

        // Clicking on area header is very tricky due to overlapping contents. Select area header using footer instead.
        const moduleItem = jcontentPageBuilder.getModule('/sites/jcontentSite/home/area-main/test-content1');
        moduleItem.click();
        moduleItem.getFooter().getItemPathDropdown().open().select('area-main');

        const header = jcontentPageBuilder.getModule('/sites/jcontentSite/home/area-main', false)
            .getHeader(false);
        header.get().scrollIntoView();
        header.getButton('contentItemActionsMenu').click();
        const menu = getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
        menu.selectByRole('paste');
        cy.get('#message-id').contains('successfully pasted');
        jcontentPageBuilder.refresh();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        jcontentPageBuilder.getModule('/sites/jcontentSite/home/area-main/test-content-path2').should('exist');
    });

    it('Checks that delete, copy and cut menu items are not present on areas in structured view', () => {
        jcontent.switchToStructuredView();
        const menu = jcontent.getTable().getRowByLabel('landing')
            .contextMenu();
        menu.shouldNotHaveItem('Delete');
        menu.shouldNotHaveItem('Copy');
        menu.shouldNotHaveItem('Cut');
        menu.shouldHaveItem('Edit');
    });
});
