import {JContent} from '../../../page-object';
import gql from 'graphql-tag';

describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/menuActions/createDeleteContent.graphql'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    const markForDeletionMutation = path => {
        return gql`mutation MarkForDeletionMutation {
            jcr { markNodeForDeletion(pathOrId: "${path}") }
        }`;
    };

    it('Can cancel mark for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="cancel-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can mark root and subnodes for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete 3 items, including 3 page(s)')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

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

    it('Cannot undelete non-root node', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Undelete non-root node');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and cannot be marked for deletion');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be undeleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can undelete root node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Undelete root node');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and can be undeleted');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Do you really want to undelete 3 items, including 3 page(s)')
            .find('[data-sel-role="delete-undelete-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify menu and subpages has been undeleted');
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: `/sites/${siteKey}/home/test-pageDelete1`}
        }).should(resp => {
            const {mixinTypes, children} = resp?.data?.jcr.nodeByPath;
            expect(mixinTypes).to.be.empty;
            expect(children.nodes.every(n => !n.mixinTypes.length)).to.be.true;
        });
    });

    it('It refreshes table and show notification when there is an error during deletion', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete 3 items, including 3 page(s)');

        cy.apollo({
            mutation: markForDeletionMutation(`/sites/${siteKey}/home/test-pageDelete1`)
        });

        cy.get(dialogCss).find('[data-sel-role="delete-mark-button"]').click();
        cy.get(dialogCss).should('not.exist');
        cy.contains('Could not perform the requested operation on selected content. Closing dialog and refreshing data.');
        cy.get('[role="alertdialog"]').find('button').click();
        cy.contains('[data-cm-role="table-content-list-row"]', 'Page test 1').first().as('pageTest1Row');
        cy.get('@pageTest1Row').find('[data-cm-role="publication-info"]').should('have.attr', 'data-cm-value', 'NOT_PUBLISHED').and('contain', 'Marked for deletion by root on ');
    });

    it('Cannot delete subnodes permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Cannot delete subnodes permanently');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and cannot be deleted permanently');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be deleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can delete root node permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete 3 items, including 3 page(s)')
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

        cy.get('[data-sel-role="delete-mark-dialog"]').find('button[data-sel-role="viewUsages"]').click();
        cy.get('[data-sel-role="usages-table"]').find('button[data-sel-role="close"]').click();
    });

    it('Shows export button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 2')
            .contextMenu()
            .select('Delete');

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

    it('Can delete root node permanently and refresh selection', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .selectRowByLabel('Page test 2');

        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('delete').click();
        cy.log('Verify dialog opens and can be deleted');
        let dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete Page test 2')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete Page test 2')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(0);
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
});
