import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Page builder - boxes and header tests', () => {
    let jcontent: JContentPageBuilder;
    const siteKey = 'jcontentSite';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('should show create buttons and box when hovering', () => {
        jcontent.getModule(`/sites/${siteKey}/home/landing`).getCreateButtons().getButton('New content');
        jcontent.getModule(`/sites/${siteKey}/home/landing`).hover()
            .should('have.attr', 'data-hovered', 'true');
    });

    it('should show box with name, status and edit buttons', () => {
        const header = jcontent.getModule(`/sites/${siteKey}/home/area-main/test-content4`).getHeader(true);
        header.get().should('be.visible').find('p').contains('test-content4');
        header.assertStatus('Not published');
        header.getButton('edit');
        header.getButton('contentItemActionsMenu');
    });

    it('should trim long titles', () => {
        const header = jcontent.getModule(`/sites/${siteKey}/home/area-main/test-content8-long-text`).getHeader(true);
        header.get().should('be.visible').find('p').contains('Lorem ipsum dolor sit am...');
    });
});
