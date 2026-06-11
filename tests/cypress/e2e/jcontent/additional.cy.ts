import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

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

    it('should display Link checker and SEO and navigate to Link Checker', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'apps');

        const additionalAccordion = jcontent.getAccordionItem('apps');
        additionalAccordion.getSection().should('contain', 'Link checker');
        additionalAccordion.getSection().should('contain', 'SEO');

        additionalAccordion.getTreeItem('linkchecker').click();

        cy.frameLoaded('iframe[src*="editframe"]');
        cy.iframe('iframe[src*="editframe"]')
            .find('h2')
            .contains('Link Checker')
            .should('be.visible');
    });

    it('should not display additional panel on System Site', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'apps');
        jcontent.getSiteSwitcher().select('System Site');
        jcontent.getAccordionItem('apps').shouldNotExist();
    });
});
