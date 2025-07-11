import {JContent} from '../../page-object';
import {createSite, deleteSite, enableModule, getComponent, publishAndWaitJobEnding} from '@jahia/cypress';
import {DeleteDialog, DeletePermanentlyDialog} from '../../page-object/deleteDialog';

describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

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
        getComponent(DeleteDialog).close();
    });

    it('Can mark root and subnodes for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.getAccordionItem('pages').getTreeItem('test-pageDelete1').contextMenu().select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        getComponent(DeleteDialog).toggleRowExpanded().markForDeletion('You are about to delete 5 items, including 3 page(s)');

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
            const markedForDeletion = node => node.mixinTypes.map(m => m.name).includes('jmix:markedForDeletion');
            const allMarkedForDeletion = children.nodes.every(markedForDeletion);
            expect(allMarkedForDeletion).to.be.true;
        });
    });

    it('Cannot delete subnodes permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1/test-subpage1');
        jcontent.getAccordionItem('pages').getTreeItem('test-subpage1').contextMenu().select('Delete (permanently)');

        cy.log('Verify dialog opens and cannot be deleted permanently');
        getComponent(DeletePermanentlyDialog).assertMessage('cannot currently be deleted').close();
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
});
