import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {addPageGql, addContentGql} from '../../fixtures/jcontent/pageComposer/setLimitContent';

describe('Page builder - list limit restrictions tests', () => {
    let jcontent: JContentPageBuilder;
    const siteKey = 'pbLimitSite';

    before(() => {
        createSite(siteKey, {
            serverName: 'localhost',
            locale: 'en',
            templateSet: 'jcontent-test-template'
        });
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    describe('Content type limit', () => {
        it('should show buttons before removing limit', () => {
            const jcontent = JContent
                .visit(siteKey, 'en', 'pages/home')
                .switchToPageBuilder();
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
        });

        it('Set limit to landing section - graphql mutation', () => {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setLimit.graphql',
                variables: {path: `/sites/${siteKey}/home/landing`}
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
                .contextMenu(true)
                .select('Copy');

            cy.log('Assert no paste buttons after copy');
            jcontent.getModule('/sites/jcontentSite/home/landing')
                .getCreateButtons()
                .assertHasNoButton();
        });
    });

    // Template 'simple' from 'jcontent-test-template' has an area list limit = 3
    describe('Template limit', () => {
        const limitPage = 'limitPage';

        it('should show create button when template limit is not reached', () => {
            cy.apollo({mutation: addPageGql(siteKey, limitPage)});
            JContent.visit(siteKey, 'en', `pages/home/${limitPage}`);
            jcontent.getModule(`/sites/${siteKey}/home/${limitPage}/my-area`)
                .getCreateButtons()
                .getButton('New content');
        });

        it('should not show create button when template limit is reached', () => {
            cy.apollo({mutation: addContentGql(siteKey, limitPage)});
            JContent.visit(siteKey, 'en', `pages/home/${limitPage}`);
            jcontent.getModule(`/sites/${siteKey}/home/${limitPage}/my-area`)
                .getCreateButtons()
                .assertHasNoButton();
        });
    });

});
