import {JContent, JContentPageBuilder} from '../../page-object';
describe('Area actions', () => {
    let jcontent: JContentPageBuilder;

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
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('Checks that delete, copy and cut menu items are not present on areas in page builder', () => {
        cy.apollo({mutationFile: 'jcontent/createTextContentUnderPath.graphql', variables: {
            path: '/sites/jcontentSite/home/landing'
        }});
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        jcontent.refresh();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        const menu = jcontent.getModule('/sites/jcontentSite/home/landing')
            .contextMenu(true);
        menu.shouldNotHaveItem('Delete');
        menu.shouldNotHaveItem('Copy');
        menu.shouldNotHaveItem('Cut');
        menu.shouldHaveItem('Edit');
    });

    it('Checks that content can be pasted into the area', () => {
        jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu(true).select('Copy');
        jcontent.getModule('/sites/jcontentSite/home/landing')
            .contextMenu(true, false)
            .select('Paste');
        jcontent.refresh();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        jcontent.getModule('/sites/jcontentSite/home/landing/test-content1').should('exist');
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