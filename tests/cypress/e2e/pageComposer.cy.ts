import {JContent, JContentPageComposer} from '../page-object';

describe('Page composer', () => {
    let jcontent: JContentPageComposer;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginEditor();
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageComposer();
    });

    // describe('boxes and header', function () {
    //     it('should show box when hovering', () => {
    //         jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
    //     });
    //
    //     it('should show box with name, status and edit buttons', () => {
    //         const header = jcontent.getModule('/sites/jcontentSite/home/landing').getHeader();
    //         header.get().find('p').contains('landing');
    //         header.assertStatus('Not published');
    //         header.getButton('edit');
    //         header.getButton('contentMenu');
    //     });
    //
    //     it('should show create buttons', () => {
    //         jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons().getButton('New content');
    //     });
    // });
    //
    // describe('restrictions', function () {
    //     beforeEach(() => {
    //         cy.apollo({
    //             mutationFile: 'jcontent/removeRestrictions.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing'},
    //             errorPolicy: 'ignore'
    //         });
    //     });
    //
    //     afterEach(() => {
    //         cy.apollo({
    //             mutationFile: 'jcontent/removeRestrictions.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing'},
    //             errorPolicy: 'ignore'
    //         });
    //     });
    //
    //     it('should show 1 create buttons with restrictions', () => {
    //         cy.apollo({
    //             mutationFile: 'jcontent/setRestrictions.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:event']}
    //         });
    //
    //         JContent.visit('jcontentSite', 'en', 'pages/home');
    //
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.assertHasNoButtonForType('New content');
    //         buttons.assertHasNoButtonForType('New Banner');
    //         buttons.getButton('New');
    //     });
    //
    //     it('should show 2 create buttons with restrictions', function () {
    //         cy.apollo({
    //             mutationFile: 'jcontent/setRestrictions.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing', values: ['jnt:banner', 'jnt:event']}
    //         });
    //
    //         JContent.visit('jcontentSite', 'en', 'pages/home');
    //
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.assertHasNoButtonForType('New content');
    //         buttons.getButton('New Banner');
    //         buttons.getButton('New Event');
    //     });
    //
    //     it('should show global create button where there are too many restrictions', function () {
    //         cy.apollo({
    //             mutationFile: 'jcontent/setRestrictions.graphql',
    //             variables: {
    //                 path: '/sites/jcontentSite/home/landing',
    //                 values: ['jnt:banner', 'jnt:event', 'bootstrap3nt:carousel', 'bootstrap3nt:collapse', 'bootstrap3nt:column', 'jnt:contentFolderReference']
    //             }
    //         });
    //
    //         JContent.visit('jcontentSite', 'en', 'pages/home');
    //
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.getButton('New content');
    //         buttons.assertHasNoButtonForType('New Banner');
    //         buttons.assertHasNoButtonForType('New Event');
    //     });
    // });
    //
    // describe('clipboard', function () {
    //     it('should show paste button when we copy', function () {
    //         jcontent.refresh();
    //
    //         const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
    //         menu.select('Copy');
    //
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.assertHasNoButtonForType('New content');
    //         buttons.getButton('Paste');
    //         buttons.getButton('Paste as reference');
    //     });
    //
    //     it('remove paste button when we clear clipboard', function () {
    //         jcontent.refresh();
    //
    //         const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
    //         menu.select('Copy');
    //
    //         jcontent.clearClipboard();
    //
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.getButton('New content');
    //         buttons.assertHasNoButtonForType('Paste');
    //         buttons.assertHasNoButtonForType('Paste as reference');
    //     });
    // });
    //
    // describe('list limit', function () {
    //     function removeLimit() {
    //         cy.apollo({
    //             mutationFile: 'jcontent/removeLimit.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing'},
    //             errorPolicy: 'ignore'
    //         });
    //     }
    //
    //     before(() => {
    //         removeLimit();
    //     });
    //
    //     after(() => {
    //         removeLimit();
    //     });
    //
    //     it('should show buttons before removing limit', () => {
    //         const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
    //         buttons.getButton('New content');
    //     });
    //
    //     it('Set limit to landing section - graphql mutation', () => {
    //         cy.apollo({
    //             mutationFile: 'jcontent/setLimit.graphql',
    //             variables: {path: '/sites/jcontentSite/home/landing'}
    //         });
    //     });
    //
    //     it('should not show create button after adding limit', {retries: 3}, () => {
    //         jcontent.refresh(); // It takes a couple of refreshes before buttons disappear, add retries
    //         jcontent.getModule('/sites/jcontentSite/home/landing')
    //             .getCreateButtons()
    //             .assertHasNoButton();
    //     });
    //
    //     it('should not show paste button when limit is reached', () => {
    //         jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1')
    //             .contextMenu()
    //             .select('Copy');
    //
    //         cy.log('Assert no paste buttons after copy');
    //         jcontent.getModule('/sites/jcontentSite/home/landing')
    //             .getCreateButtons()
    //             .assertHasNoButton();
    //     });
    // });

    describe('selection', function () {
        const item1 = "/sites/digitall/home/area-main/highlights/our-companies";
        const item2 = "/sites/digitall/home/area-main/highlights/leading-by-example";
        const item3 = "/sites/digitall/home/area-main/highlights/people-first";

        it('Selects and unselects one item', () => {
            jcontent.getSelectionInfo().should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionInfo().should('have.text', '1 item selected');
            module.click();
            jcontent.getSelectionInfo().should('not.exist');
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
