import {JContent, JContentPageBuilder} from '../../page-object';
describe('Page builder', () => {
    let jcontent: JContentPageBuilder;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
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

    describe('boxes and header', function () {
        it('should show box when hovering', () => {
            jcontent.getModule('/sites/jcontentSite/home/landing').hover().should('have.attr', 'data-current', 'true');
        });

        it('should show box with name, status and edit buttons', () => {
            jcontent.getModule('/sites/jcontentSite/home/area-main/test-content4').click();
            const header = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content4').getHeader();
            header.get().find('p').contains('test-content4');
            header.assertStatus('Not published');
            header.getButton('edit');
            header.getButton('contentMenu');
        });

        it('should trim long titles', () => {
            jcontent.getModule('/sites/jcontentSite/home/area-main/test-content8-long-text').click();
            const header = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content8-long-text').getHeader();
            header.get().find('p').contains('Lorem ipsum dolor sit am...');
        });

        it('should show create buttons', () => {
            jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons().getButton('New content');
        });
    });

    it('Click on links should open modal', () => {
        jcontent.getSecondaryNav().get().find('[data-sel-role="home"] .moonstone-treeView_itemToggle').click();
        cy.contains('external-link').click();
        cy.contains('The link redirects to an external URL');
        cy.get('[data-sel-role="cancel-button"]').click();
        cy.contains('internal-xxx').click();
        cy.contains('The link redirects to Home');
        cy.get('[data-sel-role="cancel-button"]').click();
    });
});
