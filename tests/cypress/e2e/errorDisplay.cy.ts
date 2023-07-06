import {JContent} from '../page-object';

describe('Validate error handling', () => {
    const sitekey = 'jcontentSiteError';
    before(() => {
        cy.loginAndStoreSession();
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: sitekey});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: sitekey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Displays a 404 when reaching non existing page', () => {
        JContent.visit(sitekey, 'en', 'pages/home/pageerror');
        cy.get('.moonstone-layoutModule_main').contains('Page not found').should('exist');
    });

    it('Displays a 404 when reaching non existing folder', () => {
        JContent.visit(sitekey, 'en', 'content-folders/contents/foldererror');
        cy.get('.moonstone-layoutModule_main').contains('Folder not found').should('exist');
    });

    it('Displays a 404 when reaching non existing page and allow to navigate back to existing page', () => {
        const jContent = JContent.visit(sitekey, 'en', 'pages/home/pageerror');
        jContent.getAccordionItem('pages').getTreeItem('home').click({force: true});
    });

    it('Displays a 404 when reaching non existing site and allow to navigate back to existing page', () => {
        const jContent = JContent.visit(`${sitekey}error`, 'en', 'pages/home/pageerror');
        jContent.getSiteSwitcher();
        cy.get('[data-cm-role="site-switcher"]').click();
        cy.get('.moonstone-menu:visible').find('.moonstone-menuItem').contains('.moonstone-typography', sitekey, {matchCase: false}).click();
        jContent.getAccordionItem('pages').getTreeItem('home').click({force: true});
    });
});
