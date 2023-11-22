import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite, Dropdown, getComponentByRole} from '@jahia/cypress';
import {addPageGql, addContentGql} from '../../fixtures/jcontent/pageComposer/setLimitContent';
import {ContentEditor} from '../../page-object';

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

    describe('clipboard', function () {
        it('should show paste button when we copy', function () {
            jcontent.refresh();

            // Context menu does not show up; wait necessary
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(3000);

            const menu = jcontent.getModule('/sites/jcontentSite/home/area-main/test-content1').contextMenu();
            menu.select('Copy');

            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('Paste');
            buttons.getButton('Paste as reference');
        });

        it('remove paste button when we clear clipboard', function () {
            jcontent.refresh();

            // Context menu does not show up; wait necessary
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(3000);

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

    describe('selection', function () {
        const item1 = '/sites/jcontentSite/home/area-main/test-content4';
        const item2 = '/sites/jcontentSite/home/area-main/test-content5';
        const item3 = '/sites/jcontentSite/home/area-main/lookForMeTag';

        it('Selects and unselects one item when clicking outside the selected module', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
            jcontent.iframe().get().find('.blog-topbar').click();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Selects all items with meta key and deselect them with meta key', () => {
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
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module = jcontent.getModule(item2);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item1);
            module.click({metaKey: true});
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

        it('Allows to select with right click', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item3);
            module.contextMenu().select('Add to selection');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            jcontent.clearSelection();
        });

        it('Can use selection and refresh without issues', () => {
            // Tests https://jira.jahia.org/browse/BACKLOG-20987
            // Note that in some cases it may be possible to just refresh and not be able to select anything,
            // but it appears to be a different issue as we don't get 'language is required' exception from useNodeInfo
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item2);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item3);

            jcontent.clearSelection();
            jcontent.refresh();

            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
        });

        it('Opens Content Editor on double click', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
            module.doubleClick();
            const contentEditor = new ContentEditor();
            contentEditor.getSmallTextField('jnt:event_jcr:title', false).get().should('exist');
            contentEditor.cancel();
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

    // Tests to be added when content-editor is moved here
    //
    // describe('page creation', function () {
    //     it('should open page creation form', function () {
    //         jcontent.getCreatePage();
    //     });
    // });
});
