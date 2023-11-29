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
    });
});
