import {JContent, JContentPageComposer} from '../page-object';

describe('Page composer', () => {
    let jcontent: JContentPageComposer;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});

        cy.login();
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageComposer();
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('JSESSIONID');
    });

    describe('boxes and header', function () {
        it('should show box when hovering', () => {
            jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
        });

        it('should show box with name, status and edit buttons', () => {
            const header = jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
            header.get().find('p').contains('landing');
            header.assertStatus('Not published');
            header.getButton('edit');
            header.getButton('contentMenu');
        });

        it('should show create buttons', () => {
            jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons().getButton('New content');
        });
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
                mutationFile: 'jcontent/setRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:event']}
            });

            jcontent.refresh();

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.assertHasNoButtonForType('New Banner');
            buttons.getButton('New');
        });

        it('should show 2 create buttons with restrictions', function () {
            cy.apollo({
                mutationFile: 'jcontent/setRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:banner', 'jnt:event']}
            });

            jcontent.refresh();

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('New Banner');
            buttons.getButton('New Event');
        });

        it('should show global create button where there are too many restrictions', function () {
            cy.apollo({
                mutationFile: 'jcontent/setRestrictions.graphql',
                variables: {
                    path: '/sites/jcontentSite/home/landing',
                    values: ['jnt:banner', 'jnt:event', 'bootstrap3nt:carousel', 'bootstrap3nt:collapse', 'bootstrap3nt:column', 'jnt:contentFolderReference']
                }
            });

            jcontent.refresh();

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
            buttons.assertHasNoButtonForType('New Banner');
            buttons.assertHasNoButtonForType('New Event');
        });
    });

    describe('clipboard', function () {
        it('should show paste button when we copy', function () {
            jcontent.refresh();

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
            menu.select('Copy');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('Paste');
            buttons.getButton('Paste as reference');
        });

        it('remove paste button when we clear clipboard', function () {
            jcontent.refresh();

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
            menu.select('Copy');

            jcontent.clearClipboard();

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
            buttons.assertHasNoButtonForType('Paste');
            buttons.assertHasNoButtonForType('Paste as reference');
        });
    });

    describe('list limit', function () {
        beforeEach(function () {
            cy.apollo({
                mutationFile: 'jcontent/removeLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        });

        afterEach(function () {
            cy.apollo({
                mutationFile: 'jcontent/removeLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        });

        it('should not show create button when limit is reached', function () {
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');

            cy.apollo({
                mutationFile: 'jcontent/setLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'}
            });

            jcontent.refresh();

            const buttons2 = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons2.assertHasNoButton();
        });

        it('should not show paste button when limit is reached', function () {
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');

            cy.apollo({
                mutationFile: 'jcontent/setLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'}
            });

            jcontent.refresh();

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
            menu.select('Copy');

            const buttons2 = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons2.assertHasNoButton();
        });
    });

    // Tests to be added when content-editor is moved here
    //
    // describe('page creation', function () {
    //     it('should open page creation form', function () {
    //         jcontent.getCreatePage();
    //     });
    // });
});
