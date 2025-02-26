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
        jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons().getButton('New content');
        jcontent.getModule('/sites/jcontentSite/home/landing').hover()
            .should('have.attr', 'data-hovered', 'true');
    });

    it('should show box with name, status and edit buttons', () => {
        jcontent.getModule('/sites/jcontentSite/home/area-main/test-content4').click();
        const header = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content4', false).getHeader();
        header.get().find('p').contains('test-content4');
        header.assertStatus('Not published');
        header.getButton('edit');
        header.getButton('contentItemActionsMenu');
    });

    it('should trim long titles', () => {
        jcontent.getModule('/sites/jcontentSite/home/area-main/test-content8-long-text').click();
        const header = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content8-long-text', false).getHeader();
        header.get().find('p').contains('Lorem ipsum dolor sit am...');
    });
});
