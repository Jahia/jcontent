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

        cy.apollo({
            mutationFile: 'jcontent/removeRestrictions.graphql',
            variables: {path: '/sites/jcontentSite/home/landing'},
            errorPolicy: 'ignore'
        });
    });

    it('Should show box when hovering', () => {
        jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
    });

    it('Should show box with name, status and edit buttons', () => {
        const header = jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
        header.get().find('p').contains('landing');
        header.get().find('.moonstone-chip.moonstone-color_warning').contains('Not published');
        header.get().find('button[data-sel-role="edit"]');
        header.get().find('button[data-sel-role="contentMenu"]');
    });

    it('should show create buttons', () => {
        jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons().getButton('New content');
    });

    it('should show 1 create buttons with restrictions', () => {
        cy.apollo({
            mutationFile: 'jcontent/setRestrictions.graphql',
            variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:event']}
        });

        jcontent.refresh();

        const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
        buttons.assertHasNoButton('New content');
        buttons.assertHasNoButton('New Banner');
        buttons.getButton('New Event');
    });

    it('should show 2 create buttons with restrictions', function () {
        cy.apollo({
            mutationFile: 'jcontent/setRestrictions.graphql',
            variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:banner', 'jnt:event']}
        });

        jcontent.refresh();

        const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
        buttons.assertHasNoButton('New content');
        buttons.getButton('New Banner');
        buttons.getButton('New Event');
    });

    it('should show global create button wher there are too many restrictions', function () {
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
        buttons.assertHasNoButton('New Banner');
        buttons.assertHasNoButton('New Event');
    });

    it('should show paste button when we copy', function () {
        jcontent.refresh();

        const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
        menu.select('Copy');

        const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
        buttons.assertHasNoButton('New content');
        buttons.getButton('Paste');
        buttons.getButton('Paste as reference');
    });
});
