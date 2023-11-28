import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {addPageGql, addContentGql} from '../../fixtures/jcontent/pageComposer/setLimitContent';

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

    describe('list limit', function () {
        const limitSiteKey = 'limitSite';

        function removeLimit() {
            cy.apollo({
                mutationFile: 'jcontent/removeLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        }

        before(() => {
            removeLimit();
            createSite(limitSiteKey, {
                serverName: 'localhost',
                locale: 'en',
                templateSet: 'jcontent-test-template'
            });
        });

        after(() => {
            removeLimit();
            deleteSite(limitSiteKey);
        });

        it('should show buttons before removing limit', () => {
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
        });

        it('Set limit to landing section - graphql mutation', () => {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'}
            });
        });

        it('should not show create button after adding limit', {retries: 3}, () => {
            jcontent.refresh(); // It takes a couple of refreshes before buttons disappear, add retries
            jcontent.getModule('/sites/jcontentSite/home/landing')
                .getCreateButtons()
                .assertHasNoButton();
        });

        it('should not show paste button when limit is reached', () => {
            jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1')
                .contextMenu()
                .select('Copy');

            cy.log('Assert no paste buttons after copy');
            jcontent.getModule('/sites/jcontentSite/home/landing')
                .getCreateButtons()
                .assertHasNoButton();
        });

        // Template 'simple' from 'jcontent-test-template' has an area list limit = 3

        const limitPage = 'limitPage';

        it('should show create button when template limit is not reached', () => {
            cy.apollo({
                mutation: addPageGql(limitSiteKey, limitPage)
            });
            JContent.visit(limitSiteKey, 'en', `pages/home/${limitPage}`);
            jcontent.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area`)
                .getCreateButtons()
                .getButton('New content');
        });

        it('should not show create button when template limit is reached', () => {
            cy.apollo({
                mutation: addContentGql(limitSiteKey, limitPage)
            });
            JContent.visit(limitSiteKey, 'en', `pages/home/${limitPage}`);
            jcontent.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area`)
                .getCreateButtons()
                .assertHasNoButton();
        });
    });
});
