import {JContent} from '../../page-object';
describe('Area actions', () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
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
        cy.apollo({mutationFile: 'jcontent/createTextContentUnderPath.graphql', variables: {
            path: '/sites/jcontentSite/home/landing'
        }});
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        jcontentPageBuilder.refresh();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        const menu = jcontentPageBuilder.getModule('/sites/jcontentSite/home/landing')
            .contextMenu(true);
        menu.shouldNotHaveItem('Delete');
        menu.shouldNotHaveItem('Copy');
        menu.shouldNotHaveItem('Cut');
        menu.shouldHaveItem('Edit');
    });

    it('Checks that content can be pasted into the area', () => {
        const jcontentPageBuilder = jcontent.switchToPageBuilder();
        jcontentPageBuilder.getModule('/sites/jcontentSite/home/landing/test-content-path2').contextMenu(true).select('Copy');

        // Clicking on area header is very tricky due to overlapping contents. Select area header using footer instead.
        const moduleItem = jcontentPageBuilder.getModule('/sites/jcontentSite/home/area-main/test-content1');
        moduleItem.click();
        moduleItem.getFooter().getBreadcrumbs().select('area-main');

        jcontentPageBuilder.getModule('/sites/jcontentSite/home/area-main')
            .contextMenu(false)
            .select('Paste');
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
