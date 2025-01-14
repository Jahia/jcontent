import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {createSite, deleteSite, enableModule, publishAndWaitJobEnding} from '@jahia/cypress';

describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

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
    });

    beforeEach(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        deleteSite(siteKey);
        cy.logout();
    });

    it('Can cancel mark for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete1').contextMenu().select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="cancel-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can mark root and subnodes for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete1').contextMenu().select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        confirmMarkForDeletion('You are about to delete 5 items, including 3 page(s)');

        cy.log('Verify menu and subpages has been marked for deletion');
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: `/sites/${siteKey}/home/test-pageDelete1`}
        }).should(resp => {
            const {mixinTypes, children} = resp?.data?.jcr.nodeByPath;
            expect(mixinTypes).to.not.be.empty;
            expect(mixinTypes.map(m => m.name)).to.include('jmix:markedForDeletion');
            expect(mixinTypes.map(m => m.name)).to.include('jmix:markedForDeletionRoot');

            // Verify all children have been marked for deletion
            const allMarkedForDeletion = children.nodes.every(n => {
                return n.mixinTypes.map(m => m.name).includes('jmix:markedForDeletion');
            });
            expect(allMarkedForDeletion).to.be.true;
        });
    });

    it('Cannot delete subnodes permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1/test-subpage1');
        jcontent.getAccordionItem('pages').getTreeItem('test-subpage1').contextMenu().select('Delete (permanently)');

        cy.log('Verify dialog opens and cannot be deleted permanently');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be deleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Cannot undelete non-root node', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1/test-subpage1');

        cy.log('Undelete non-root node');
        jcontent.getAccordionItem('pages').getTreeItem('test-subpage1').contextMenu().select('Undelete');

        cy.log('Verify dialog opens and cannot be marked for deletion');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be undeleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can undelete root node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');

        cy.log('Undelete root node');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete1').contextMenu().select('Undelete');

        cy.log('Verify dialog opens and can be undeleted');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Do you really want to undelete 5 items, including 3 page(s)')
            .find('[data-sel-role="delete-undelete-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify menu and subpages has been undeleted');
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: `/sites/${siteKey}/home/test-pageDelete1`}
        }).should(resp => {
            const {mixinTypes, children} = resp?.data?.jcr.nodeByPath;
            expect(mixinTypes.map(m => m.name)).to.not.include('jmix:markedForDeletion');
            expect(mixinTypes.map(m => m.name)).to.not.include('jmix:markedForDeletionRoot');
            expect(children.nodes.every(n => !n.mixinTypes.includes('jmix:markedForDeletion'))).to.be.true;
        });
    });

    it('show warning when content is referenced', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 3')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="cancel-button"]')
            .click();
        cy.contains('This item is currently referenced by other items.');
        cy.get(dialogCss).should('not.exist');
    });

    it('shows usages button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 3')
            .contextMenu()
            .select('Delete');

        cy.get('[data-sel-role="delete-mark-dialog"]').contains('1 usage').click();
        cy.get('[data-sel-role="usages-table"]').as('usagesTable').should('contain', 'test-delete3-ref').and('contain', 'Content reference');
        cy.get('@usagesTable').find('button[data-sel-role="close"]').click();
    });

    it('Shows export button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete2');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete2').contextMenu().select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="exportPage"]');
    });

    it('Shows download zip button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.switchToListMode();
        jcontent.getTable()
            .getRowByLabel('test-folderDelete1')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="downloadAsZip"]');
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

    it('does not show delete if jmix:hideDeleteAction is set', () => {
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
});
