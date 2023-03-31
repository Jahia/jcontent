import {JContent} from '../../page-object';
import gql from 'graphql-tag';

describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/menuActions/createDeleteContent.graphql'});
    });

    beforeEach(() => {
        cy.loginEditor(); // Edit in chief
    });

    after(function () {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    const switchToSubpages = count => {
        cy.get('button[data-cm-view-type="pages"]')
            .should('contain', count)// Need to wait until data is loaded i.e. count is visible
            .click({force: true});
    };

    const markForDeletionMutation = path => {
        return gql`mutation MarkForDeletionMutation {
            jcr { markNodeForDeletion(pathOrId: "${path}") }
        }`;
    };

    it('Can cancel mark for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        switchToSubpages(3);

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
        switchToSubpages(3);

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete 3 items, including 3 pages')
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
        switchToSubpages(2);

        cy.log('Undelete non-root node');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and cannot be marked for deletion');
        const dialogCss = '[data-sel-role$="undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Cannot be undeleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can undelete root node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        switchToSubpages(3);

        cy.log('Undelete root node');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and can be undeleted');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Do you really want to undelete 3 items, including 3 pages')
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

    it('Mark nodes for deletion - gql', () => {
        cy.apollo({
            mutation: markForDeletionMutation(`/sites/${siteKey}/home/test-pageDelete1`)
        });
    });

    it('Cannot delete subnodes permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        switchToSubpages(2);

        cy.log('Cannot delete subnodes permanently');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and cannot be deleted permanently');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Cannot be deleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can delete root node permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        switchToSubpages(3);

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete 3 items, including 3 pages')
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
    });
});
