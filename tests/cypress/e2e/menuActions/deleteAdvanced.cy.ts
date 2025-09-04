import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {PageComposer} from '../../page-object/pageComposer';
import {
    createSite,
    deleteSite,
    enableModule,
    getComponent,
    markForDeletion,
    publishAndWaitJobEnding
} from '@jahia/cypress';
import {DeleteDialog, DeletePermanentlyDialog, UndeleteDialog} from '../../page-object/deleteDialog';

/**
 * Split from delete.cy.ts due to crashing from too many tests
 * All advanced setup and modification tests for delete actions have been moved here
 */
describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        cy.apollo({mutationFile: 'jcontent/menuActions/createDeleteContent.graphql'})
            .then(() => publishAndWaitJobEnding(`/sites/${siteKey}/home/test-pageDelete3/test-subpage3`));
        markForDeletion(`/sites/${siteKey}/home/test-pageDelete1`);
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
        getComponent(DeletePermanentlyDialog).delete();

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
        getComponent(DeleteDialog).markForDeletion('You are about to delete');
        jcontent.checkSelectionCount(1);

        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        getComponent(DeletePermanentlyDialog).delete();
        jcontent.checkSelectionCount(0);
    });

    it('selects the parent in jContent nav if current selection has been deleted', () => {
        const relPath = 'home/test-pageDelete3/test-subpage3';
        const jcontent = JContent.visit(siteKey, 'en', `pages/${relPath}`);

        cy.log('mark published page for deletion');
        jcontent.getAccordionItem('pages').getTreeItem('test-subpage3').contextMenu().select('Delete');
        // Sometimes this test fails with dialog showing 'You are about to delete 4 items' instead of 3 items
        // - page itself + area-main and landing sections
        // Toggle the row to see what is going on
        getComponent(DeleteDialog).toggleRowExpanded();
        getComponent(DeleteDialog).markForDeletion('You are about to delete 3 items, including 1 page(s)');

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
        getComponent(DeleteDialog).markForDeletion('You are about to delete Soon to be deleted');
        jcontent.checkSelectionCount(1);

        cy.log('Verify dialog opens and can be deleted');
        jcontent.getHeaderActionButton('deletePermanently').click();
        getComponent(DeletePermanentlyDialog).delete();
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
        getComponent(DeletePermanentlyDialog).delete();

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

    it('Does not show delete action on locked nodes', () => {
        cy.apollo({mutation: gql`mutation lockNode {
                jcr {
                    mutateNode(pathOrId: "/sites/${siteKey}/contents/test-deleteContents/test-delete6") {
                        lock
                    }
                }
            }`});

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');
        jcontent.getTable().getRowByLabel('test 6').contextMenu().should('not.contain', 'Delete');
    });

    it.skip('does not show delete if jmix:hideDeleteAction is set', () => {
        cy.apollo({mutation: gql`mutation {
                jcr {
                    mutateNode(pathOrId:"/sites/${siteKey}/contents/test-deleteContents/test-delete1") {
                        addMixins(mixins: ["jmix:hideDeleteAction"])
                    }
                }
            }`
        });
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');
        cy.get('.moonstone-header h1').contains('test-deleteContents').should('be.visible');
        jcontent.getTable().getRowByLabel('test 2').contextMenu().should('contain', 'Delete');
        cy.get('.moonstone-menu_overlay').click();
        jcontent.getTable().getRowByLabel('test 1').contextMenu().should('not.contain', 'Delete');
        cy.get('.moonstone-menu_overlay').click();
        jcontent.getTable().getRowByLabel('test 1').contextMenu().select('Copy');
        cy.get('#message-id').contains('is in the clipboard');
        jcontent.getTable().getRowByLabel('content-folder1').get().dblclick();
        jcontent.getHeaderActionButton('paste').click();
        jcontent.getTable().getRowByLabel('test 1').contextMenu().should('contain', 'Delete');
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
            getComponent(DeleteDialog).markForDeletion();
            pageComposer.refresh();

            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openUndeleteDialog();
            getComponent(UndeleteDialog).undelete();
            pageComposer.refresh();

            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeleteDialog();
            getComponent(DeleteDialog).markForDeletion();

            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeletePermanentlyDialog();
            getComponent(DeletePermanentlyDialog).delete();
        });
    });
});
