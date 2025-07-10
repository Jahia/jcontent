import {JContent, JContentPageBuilder} from '../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {addPageGql, addContentGql} from '../../fixtures/jcontent/pageComposer/setLimitContent';

describe('Page builder - list limit restrictions tests', () => {
    before(() => {
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    describe('Content type limit', () => {
        const contentSiteKey = 'contentLimitSite';
        let jcontent: JContentPageBuilder;

        before(() => {
            createSite(contentSiteKey);
            cy.apollo({
                mutationFile: 'jcontent/createContent.graphql',
                variables: {homePath: `/sites/${contentSiteKey}/home`}
            });

            addNode({
                parentPathOrId: `/sites/${contentSiteKey}/home`,
                name: 'landing',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'test-content1',
                    primaryNodeType: 'jnt:bigText',
                    properties: [{name: 'text', language: 'en', value: 'test 1'}]
                }]
            });
        });

        beforeEach(() => {
            jcontent = JContent
                .visit(contentSiteKey, 'en', 'pages/home')
                .switchToPageBuilder();
        });

        after(() => {
            cy.logout();
            deleteSite(contentSiteKey);
        });

        it('should show buttons before removing limit', () => {
            jcontent.getModule(`/sites/${contentSiteKey}/home/landing`)
                .getCreateButtons()
                .getButton('New content');
        });

        it('sets limit to landing section using graphql', () => {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setLimit.graphql',
                variables: {path: `/sites/${contentSiteKey}/home/landing`}
            });
        });

        it('should not show create button after adding limit', () => {
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            jcontent.refresh();
            jcontent.getModule(`/sites/${contentSiteKey}/home/landing`).assertHasNoCreateButtons();
        });

        it('should not show paste button when limit is reached', () => {
            jcontent.getModule(`/sites/${contentSiteKey}/home/area-main/test-content1`, false)
                .contextMenu(true)
                .select('Copy');

            cy.log('Assert no paste buttons after copy');
            jcontent.getModule(`/sites/${contentSiteKey}/home/landing`).assertHasNoCreateButtons();
        });
    });

    // Template 'simple' from 'jcontent-test-template' has an area list limit = 3
    describe('Template limit', () => {
        const limitSiteKey = 'pbLimitSite';
        const limitPage = 'limitPage';

        before(() => {
            createSite(limitSiteKey, {
                serverName: 'localhost',
                locale: 'en',
                templateSet: 'jcontent-test-template'
            });
        });

        after(() => {
            cy.logout();
            deleteSite(limitSiteKey);
        });

        it('should show create button when template limit is not reached', () => {
            cy.apollo({
                mutation: addPageGql(limitSiteKey, limitPage)
            });
            const jcontent = JContent.visit(limitSiteKey, 'en', `pages/home/${limitPage}`);
            const pageBuilder = new JContentPageBuilder(jcontent);
            pageBuilder.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area`)
                .getCreateButtons()
                .getButton('New content');
        });

        it('should not show create button or paste buttons when template limit is reached', () => {
            cy.apollo({mutation: addContentGql(limitSiteKey, limitPage)});
            const jcontent = JContent.visit(limitSiteKey, 'en', `pages/home/${limitPage}`);
            const pageBuilder = new JContentPageBuilder(jcontent);

            cy.log('it should not show create buttons');
            pageBuilder.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area`).assertHasNoCreateButtons();

            cy.log('it should not show paste buttons');
            pageBuilder.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area/abc1`, false)
                .contextMenu(false)
                .selectByRole('copy');
            cy.get('#message-id').contains('in the clipboard');
            const restrictedArea = pageBuilder.getModule(`/sites/${limitSiteKey}/home/${limitPage}/my-area`, false);
            const buttons = restrictedArea.getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.assertHasNoButtonForRole('paste');
            buttons.assertHasNoButtonForRole('pasteReference');
        });
    });
});
