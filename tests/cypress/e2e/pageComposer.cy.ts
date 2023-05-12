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

            JContent.visit('jcontentSite', 'en', 'pages/home');

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

            JContent.visit('jcontentSite', 'en', 'pages/home');

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

            JContent.visit('jcontentSite', 'en', 'pages/home');

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
        function removeLimit() {
            cy.apollo({
                mutationFile: 'jcontent/removeLimit.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
        }

        before(() => {
            removeLimit();
        });

        after(() => {
            removeLimit();
        });

        it('should show buttons before removing limit', () => {
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.getButton('New content');
        });

        it('Set limit to landing section - graphql mutation', () => {
            cy.apollo({
                mutationFile: 'jcontent/setLimit.graphql',
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
    });

    describe('selection', function () {
        const item1 = '/sites/jcontentSite/home/area-main/test-content4';
        const item2 = '/sites/jcontentSite/home/area-main/test-content5';
        const item3 = '/sites/jcontentSite/home/area-main/lookForMeSystemName';

        it('Selects and unselects one item', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
            module.click();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Selects all items with meta key', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item2);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module = jcontent.getModule(item3);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '3 items selected');

            // Unselect by clicking
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module = jcontent.getModule(item2);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item1);
            module.click();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Always selects one item without meta key', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item2);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item3);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
        });

        it('Clears selection when unselected', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module.parentFrame.get().find('div[data-current="true"]').should('exist');

            jcontent.clearSelection();

            // For some reason clearing of selection does not refresh iframe contents in the test browser like it does
            // in a real one. So this test is not a complete one.
            jcontent.refresh();
            // Doesn't work: module.parentFrame.get().find('div[data-current="true"]').should('not.exist');
        });

        it('Maintains selection when navigating back and forth from different modes', () => {
            const absoluteArea = '/sites/jcontentSite/home/footer-1';
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            // Select absolute area
            const module = jcontent.getModule(absoluteArea);
            module.click('top');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            // Check selection in structured mode
            jcontent.switchToMode('Structured');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            // Check that selection is removed in list view
            jcontent.switchToMode('List');
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            cy.contains('1 previously selected');

            // Select a couple of rows in list view
            const ct = jcontent.getTable();
            ct.selectRowByLabel('test 1');
            ct.selectRowByLabel('test 2');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            // Check selection in structured mode
            jcontent.switchToMode('Structured');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            // Check selection in PC mode
            jcontent.switchToMode('Page Composer');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');
        });

        it('Allows to select with right click', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.contextMenu().select('Add to selection');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module.contextMenu().get().find('span').contains('1 item selected');

            module = jcontent.getModule(item3);
            module.contextMenu().select('Add to selection');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module.contextMenu().get().find('span').contains('2 items selected');
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
