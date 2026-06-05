import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, getComponent, Menu, uploadFile} from '@jahia/cypress';
import {GraphqlUtils} from '../../utils/graphqlUtils';

const SLOW_QUERY_DELAY_MS = 2000;
const MENU_VISIBILITY_THRESHOLD_MS = 1500;

describe('Context menu visiblity', () => {
    const siteKey = 'contextMenuSite';
    const folderName = 'test-folder';
    const childFolderName = 'test-child-folder';
    const fileName = 'test-file.pdf';

    before(() => {
        createSite(siteKey);
        uploadFile(
            '/assets/uploadMedia/myfile.pdf',
            `/sites/${siteKey}/files`,
            fileName,
            'application/pdf'
        );
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: folderName,
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/${folderName}`,
            name: childFolderName,
            primaryNodeType: 'jnt:contentFolder'
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    describe('loading state', () => {
        it('should show skeleton items while GQL is in-flight', () => {
            const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
            jcontent.switchToListMode();
            jcontent.getTable().getRowByName(childFolderName).get().should('be.visible');

            cy.intercept('POST', '/modules/graphql', req => {
                req.reply(res => {
                    res.setDelay(SLOW_QUERY_DELAY_MS);
                });
            }).as('slowAllGql');

            jcontent.getTable().getRowByName(childFolderName).get().rightclick();

            cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)', {
                timeout: MENU_VISIBILITY_THRESHOLD_MS
            }).should('be.visible')
                .find('[data-sel-role="menu-item-skeleton"]')
                .should('have.length.greaterThan', 0);

            cy.wait('@slowAllGql');
            cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
                .find('[data-sel-role="menu-item-skeleton"]')
                .should('not.exist');
        });
    });

    /**
     * Context menu action visibility tests.
     *
     * These tests validate that the early-check pre-gates (isDefinitelyHidden) in each
     * action component correctly show or hide actions based on the node type and mixin
     * data available from the prefetched row, before any useNodeChecks GQL request fires.
     *
     * Each test right-clicks on a node of a specific type and asserts the presence or
     * absence of menu items that should be gated by node type or mixin checks:
     *
     * - showOnNodeTypes: ['jnt:file'] gates → Download, Rename (media), Edit Image, Zip/Unzip
     * - showOnNodeTypes: ['jnt:folder'] gates → Rename (media folders)
     * - hideMixins: ['jmix:markedForDeletion'] gates → Delete (mark for deletion) hidden
     *   when node is already marked
     */
    describe('action visibility', () => {
        describe('jnt:file node', () => {
            it('should show Download action', () => {
                const jcontent = JContent.visit(siteKey, 'en', 'media/files');
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(fileName).contextMenu();
                getComponent(Menu).shouldHaveRoleItem('downloadFile');
            });

            it('should show Rename action', () => {
                const jcontent = JContent.visit(siteKey, 'en', 'media/files');
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(fileName).contextMenu();
                getComponent(Menu).shouldHaveRoleItem('rename');
            });
        });

        describe('jnt:contentFolder node', () => {
            it('should NOT show Download action', () => {
                const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(childFolderName).contextMenu();
                getComponent(Menu).shouldNotHaveRoleItem('downloadFile');
            });

            it('should NOT show Rename action', () => {
                const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(childFolderName).contextMenu();
                getComponent(Menu).shouldNotHaveRoleItem('rename');
            });

            it('should show Delete action when not marked for deletion', () => {
                const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(childFolderName).contextMenu();
                getComponent(Menu).shouldHaveRoleItem('delete');
            });
        });

        describe('node already marked for deletion', () => {
            const markedFolderName = 'marked-folder';

            before(() => {
                addNode({
                    parentPathOrId: `/sites/${siteKey}/contents/${folderName}`,
                    name: markedFolderName,
                    primaryNodeType: 'jnt:contentFolder'
                });
                GraphqlUtils.addMixins(
                    `/sites/${siteKey}/contents/${folderName}/${markedFolderName}`,
                    ['jmix:markedForDeletion', 'jmix:markedForDeletionRoot']
                );
            });

            it('should NOT show Delete action', () => {
                const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(markedFolderName).contextMenu();
                getComponent(Menu).shouldNotHaveRoleItem('delete');
            });

            it('should show Delete permanently action', () => {
                const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
                jcontent.switchToListMode();
                jcontent.getTable().getRowByName(markedFolderName).contextMenu();
                getComponent(Menu).shouldHaveRoleItem('deletePermanently');
            });
        });
    });
});
