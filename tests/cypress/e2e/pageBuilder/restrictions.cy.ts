import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {addNode, createSite, deleteNode, deleteSite} from '@jahia/cypress';
import {addRestrictedPage} from '../../fixtures/jcontent/restrictions.gql.js';
import {MultipleLeftRightField} from '../../page-object/fields/multipleLeftRightField';

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
    });

    describe('restrictions', function () {
        beforeEach(() => {
            cy.apollo({
                mutationFile: 'jcontent/removeRestrictions.graphql',
                variables: {path: '/sites/jcontentSite/home/landing'},
                errorPolicy: 'ignore'
            });
            jcontent = JContent
                .visit('jcontentSite', 'en', 'pages/home')
                .switchToPageBuilder();
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

    describe('area restrictions', function () {
        beforeEach(() => {
            addNode({
                name: 'absoluteArea',
                parentPathOrId: '/sites/jcontentSite/home/area-main',
                primaryNodeType: 'jnt:absoluteArea',
                properties: [
                    {name: 'j:allowedTypes', values: ['jnt:event']},
                    {name: 'j:numberOfItems', value: 2},
                    {name: 'j:level', value: 0}
                ]
            });
            jcontent = JContent
                .visit('jcontentSite', 'en', 'pages/home')
                .switchToPageBuilder();
        });

        afterEach(() => {
            deleteNode('/sites/jcontentSite/home/area-main/absoluteArea');
        });

        it('should have nodetype and list limit restrictions on absolute areas', function () {
            jcontent = JContent
                .visit('jcontentSite', 'en', 'pages/home')
                .switchToPageBuilder();
            const absoluteArea = jcontent.getModule('/sites/jcontentSite/home/area-main/absoluteArea');
            absoluteArea.get().find('[jahiatype="module"][type="absoluteArea"]').should('have.attr', 'listlimit', '2');
            const buttons = absoluteArea.getCreateButtons();
            buttons.assertHasNoButtonForType('New content');
            buttons.getButton('New Event');
        });

        it('should display multiple create buttons consistently with restriction', () => {
            jcontent.switchToStructuredView();
            const row = jcontent.getTable().getRowByLabel('landing');
            row.contextMenu().selectByRole('edit');
            const contentEditor = new ContentEditor();
            contentEditor.toggleOption('jmix:contributeMode', 'Content type restrictions');
            contentEditor.getField(MultipleLeftRightField, 'jmix:contributeMode_j:contributeTypes', true)
                .addNewValue('Banner')
                .addNewValue('Collapse');
            contentEditor.save();

            jcontent.switchToPageBuilder();

            const restrictedArea = jcontent.getModule('/sites/jcontentSite/home/landing', false);
            const buttons = restrictedArea.getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.getButtonByRole('bootstrap3nt:collapse').should('exist');
            buttons.getButtonByRole('jnt:banner').should('exist');
        });
    });

    // Template 'contentType' from 'jcontent-test-template' has an area content restriction of pbnt:contentRestriction
    describe('Template content type restriction', () => {
        const siteKey = 'restrictedSite';
        const pageName = 'myPage';

        before(() => {
            createSite(siteKey, {
                serverName: 'localhost',
                locale: 'en',
                templateSet: 'jcontent-test-template'
            });
            cy.apollo({mutation: addRestrictedPage(siteKey, pageName)});
        });

        after(() => {
            cy.logout();
            deleteSite(siteKey);
        });

        it('should check restrictions when displaying paste button', () => {
            const pageBuilder = JContent
                .visit(siteKey, 'en', `pages/home/${pageName}`)
                .switchToPageBuilder();

            cy.log('disable button when not allowed');
            pageBuilder.getModule(`/sites/${siteKey}/home/${pageName}/any-area/notAllowedText`, false)
                .contextMenu(false, false)
                .selectByRole('copy');
            cy.get('#message-id').contains('in the clipboard');

            const restrictedArea = pageBuilder.getModule(`/sites/${siteKey}/home/${pageName}/restricted-area`, false);
            let buttons = restrictedArea.getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.getButtonByRole('pastePB').should('be.visible').and('have.attr', 'disabled');
            buttons.getButtonByRole('pasteReferencePB').should('be.visible').and('have.attr', 'disabled');

            cy.log('enable button when allowed');
            pageBuilder.getModule(`/sites/${siteKey}/home/${pageName}/any-area/allowedText`, false)
                .contextMenu(false, false)
                .selectByRole('copy');
            cy.get('#message-id').contains('in the clipboard');

            const restrictedArea = pageBuilder.getModule(`/sites/${siteKey}/home/${pageName}/restricted-area`, false);
            let buttons = restrictedArea.getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.getButtonByRole('pastePB').should('be.visible').and('not.have.attr', 'disabled');
            buttons.getButtonByRole('pasteReferencePB').should('be.visible').and('not.have.attr', 'disabled');
        });

        it('should restrict create content with page builder create buttons and context menu', () => {
            const pageBuilder = JContent
                .visit(siteKey, 'en', `pages/home/${pageName}`)
                .switchToPageBuilder();

            cy.log('restricted-area should restrict create buttons for pbnt:contentRestriction only');
            const restrictedArea = pageBuilder.getModule(`/sites/${siteKey}/home/${pageName}/restricted-area`, false);
            const buttons = restrictedArea.getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.assertHasNoButtonForRole('createContent');
            buttons.getButtonByRole('pbnt:contentRestriction').should('be.visible');

            cy.log('restricted-area should restrict context menu create buttons for pbnt:contentRestriction only');
            const contextMenu = pageBuilder
                .getModule(`/sites/${siteKey}/home/${pageName}/restricted-area`, false)
                .emptyAreaContextMenu();
            contextMenu.shouldNotHaveRoleItem('createContent');
            contextMenu.shouldHaveRoleItem('pbnt:contentRestriction');
        });
    });
});
