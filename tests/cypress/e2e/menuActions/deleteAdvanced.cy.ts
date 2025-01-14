import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {PageComposer} from '../../page-object/pageComposer';
import {createSite, deleteSite, enableModule, publishAndWaitJobEnding} from '@jahia/cypress';

/**
 * Split from delete.cy.ts due to crashing from too many tests
 * All advanced setup and modification tests for delete actions have been moved here
 */
describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

    const markForDeletionMutation = path => {
        return gql`mutation MarkForDeletionMutation {
            jcr { markNodeForDeletion(pathOrId: "${path}") }
        }`;
    };

    const confirmMarkForDeletion = verifyMsg => {
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', verifyMsg)
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    };

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        cy.apollo({mutationFile: 'jcontent/menuActions/createDeleteContent.graphql'})
            .then(() => publishAndWaitJobEnding(`/sites/${siteKey}/home/test-pageDelete3/test-subpage3`));
        cy.apollo({mutation: markForDeletionMutation(`/sites/${siteKey}/home/test-pageDelete1`)});
    });

    beforeEach(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        deleteSite(siteKey);
        cy.logout();
    });

    it('Can delete root node permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete1').contextMenu().select('Delete (permanently)');

        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete 5 items, including 3 page(s)')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify root node is deleted');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/home/test-pageDelete1") {uuid}}}`,
            errorPolicy: 'ignore'
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).to.be.null;
        });
        jcontent.checkSelectionCount(0);
    });

    it('Can delete root node permanently and refresh selection', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .selectRowByLabel('Page test 2');
        jcontent.checkSelectionCount(1);

        jcontent.getHeaderActionButton('delete').click();
        confirmMarkForDeletion('You are about to delete 3 items, including 1 page(s)');
        jcontent.checkSelectionCount(1);

        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete Page test 2')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(0);
    });

    it('selects the parent in jContent nav if current selection has been deleted', () => {
        const relPath = 'home/test-pageDelete3/test-subpage3';
        const jcontent = JContent.visit(siteKey, 'en', `pages/${relPath}`);

        cy.log('mark published page for deletion');
        jcontent.getAccordionItem('pages').getTreeItem('test-subpage3').contextMenu().select('Delete');
        confirmMarkForDeletion('You are about to delete 3 items, including 1 page(s)');

        cy.log('Publish deletion');
        jcontent.getHeaderActionButton('publishDeletion').get().should('be.visible').click();
        jcontent.clickPublishNow();

        cy.log('Verify node is deleted');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/${relPath}") {uuid}}}`,
            errorPolicy: 'ignore'
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).to.be.null;
        });

        cy.log('Verify parent page is now selected');
        cy.url().should('not.include', 'test-subpage3')
            .and('include', '/home/test-pageDelete3');
    });

    it('Delete permanently a newly created content folder and clear selection', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');
        jcontent.getAccordionItem('content-folders').expandTreeItem('test-deleteContents');
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type('test-parent-folder');
        cy.get('[data-cm-role="create-folder-as-confirm"]').click();
        jcontent.getAccordionItem('content-folders').getTreeItem('test-parent-folder').should('be.visible').click();
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type('Soon to be deleted');
        cy.get('[data-cm-role="create-folder-as-confirm"]').click();
        jcontent.getTable().selectRowByLabel('Soon to be deleted');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('delete').click();
        cy.log('Verify dialog opens and can be deleted');
        let dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete Soon to be deleted')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete Soon to be deleted')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(0);
    });

    it('allows to permanently delete an autopublished node', () => {
        cy.log('Verify autopublished node exists before starting test');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/contents/test-deleteContents/test-delete4-autopublish") {uuid}}}`
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).not.to.be.null;
        });

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 4')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify autopublished node is deleted');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/contents/test-deleteContents/test-delete4-autopublish") {uuid}}}`,
            errorPolicy: 'ignore'
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).to.be.null;
        });
        jcontent.checkSelectionCount(0);
    });

    it('allows to mark node for deletion and context menu updates', () => {
        cy.log('Verify node exists before starting test');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/contents/test-deleteContents/test-delete5") {uuid}}}`
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).not.to.be.null;
        });

        cy.log('Try marking node for deletion');

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 5')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="delete-mark-button"]')
            .click();

        cy.log('Verify context menu updates');
        const contextMenu = jcontent.getTable().getRowByLabel('test 5').contextMenu();
        contextMenu.shouldHaveItem('Undelete');
        contextMenu.shouldHaveItem('Delete (permanently)');
    });

    describe('Legacy Page Composer GWT Tests', () => {
        const text = 'This is a text to delete in legacy page composer';

        let pageComposer: PageComposer;
        before(() => {
            cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
            cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: 'deleteInLegacy'});
            cy.apollo({
                mutation: gql`
                    mutation {
                        jcr {
                            mutateNode(pathOrId: "/sites/deleteInLegacy/home") {
                                addChild(name: "area-main", primaryNodeType: "jnt:contentList",
                                    children: [{
                                        name: "rich-text",
                                        primaryNodeType: "jnt:bigText",
                                        properties: [{ name: "text", language: "en", value: "${text}" }]
                                    }]
                                ) {
                                    uuid
                                }
                            }
                        }
                    }
                `
            });
        });

        beforeEach(() => {
            cy.loginAndStoreSession();
            pageComposer = PageComposer.visit('deleteInLegacy', 'en', 'home.html');
        });
        after(function () {
            cy.logout();
            deleteSite('deleteInLegacy');
        });

        it('opens JContent delete dialog in legacy', () => {
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeleteDialog();
            let dialogCss = '[data-sel-role="delete-mark-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-mark-button"]')
                .click();
            pageComposer.refresh();
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openUndeleteDialog();
            dialogCss = '[data-sel-role="delete-undelete-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-undelete-button"]')
                .click();
            pageComposer.refresh();
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeleteDialog();
            dialogCss = '[data-sel-role="delete-mark-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-mark-button"]').should('be.visible')
                .click();
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeletePermanentlyDialog();
            dialogCss = '[data-sel-role="delete-permanently-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-permanently-button"]')
                .click();
        });
    });
});
