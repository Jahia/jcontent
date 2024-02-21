import {JContent, JContentPageBuilder} from '../../page-object';
import {addNode, deleteNode} from '@jahia/cypress';

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

    describe('restrictions', function () {
        beforeEach(() => {
            cy.apollo({
                mutationFile: 'jcontent/removeRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        });

        afterEach(() => {
            cy.apollo({
                mutationFile: 'jcontent/removeRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        });

        it('should show 1 create buttons with restrictions', () => {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:event']}
            });

            JContent.visit('jcontentSite', 'en', 'pages/home');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.assertHasNoButtonForType('New Banner');
            buttons.getButton('New');
        });

        it('should show 2 create buttons with restrictions', function () {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:banner', 'jnt:event']}
            });

            JContent.visit('jcontentSite', 'en', 'pages/home');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('New Banner');
            buttons.getButton('New Event');
        });

        it('should show 1 create buttons in events page', () => {
            JContent.visit('jcontentSite', 'en', 'pages/home/events');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/events/Events').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('New Event');
        });

        it('should show global create button where there are too many restrictions', function () {
            cy.apollo({
                mutationFile: 'jcontent/pageComposer/setRestrictions.graphql',
                variables: {
                    path: '/sites/jcontentSite/home/landing',
                    values: ['jnt:banner', 'jnt:event', 'bootstrap3nt:carousel', 'bootstrap3nt:collapse', 'bootstrap3nt:column', 'jnt:contentFolderReference']
                }
            });

            JContent.visit('jcontentSite', 'en', 'pages/home');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
            buttons.assertHasNoButtonForType('New Banner');
            buttons.assertHasNoButtonForType('New Event');
        });

        it('should have nodetype and list limit restrictions on absolute areas', function () {
            addNode({
                name: 'absoluteArea',
                parentPathOrId: '/sites/jcontentSite/home/area-main',
                primaryNodeType: 'jnt:absoluteArea',
                properties: [
                    {name: 'j:allowedTypes', values: ['jnt:event']},
                    {name: 'j:numberOfItems', value: 2},
                    {name: 'j:level', value: 0}
                ]
            }).then(() => {
                jcontent = JContent
                    .visit('jcontentSite', 'en', 'pages/home')
                    .switchToPageBuilder();
                const absoluteArea = jcontent.getModule('/sites/jcontentSite/home/area-main/absoluteArea');
                absoluteArea.get().find('[jahiatype="module"][type="absoluteArea"]').should('have.attr', 'listlimit', '2');
                const buttons = absoluteArea.getCreateButtons();
                buttons.assertHasNoButtonForType('New content');
                buttons.getButton('New Event');
                deleteNode('/sites/jcontentSite/home/area-main/absoluteArea');
            });
        });
    });
});
