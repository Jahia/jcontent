import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

function clickAppsTreeItem(role: string): void {
    cy.get(`li[data-sel-role="${role}"]`).click();
}

describe('Test additional accordion', () => {
    const siteKey = 'additionalTestSite';

    before(() => {
        createSite(siteKey);
    });

    beforeEach(() => {
        cy.login();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should display Link checker and SEO in additional panel and navigate to Link Checker', () => {
        JContent.visit(siteKey, 'en', 'apps');

        cy.get('header[aria-controls="apps"]')
            .closest('section')
            .should('contain', 'Link checker');
        cy.get('header[aria-controls="apps"]')
            .closest('section')
            .should('contain', 'SEO');

        clickAppsTreeItem('linkchecker');

        cy.frameLoaded('iframe[src*="editframe"]');
        cy.iframe('iframe[src*="editframe"]')
            .find('h2')
            .contains('Link Checker')
            .should('be.visible');
    });

    it('should not display additional panel on System Site', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'apps');
        jcontent.getSiteSwitcher().select('System Site');
        cy.get('header[aria-controls="apps"]', {timeout: 5000})
            .should('not.exist');
    });
});
