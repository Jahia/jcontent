import {JContent} from '../../page-object';
import gql from 'graphql-tag';
import {createSite, deleteSite, enableModule, grantRoles} from "@jahia/cypress";

describe('Lock tests', () => {
    const siteKey = 'jContentSite-lock';

    before(() => {
        createSite(siteKey);
        enableModule('article', siteKey);
        cy.apollo({mutationFile: 'jcontent/menuActions/createLockContent.graphql'});
        grantRoles(`/sites/${siteKey}`, ['editor'], 'mathias', 'USER');
    });

    beforeEach(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    function lockNode(path) {
        cy.apollo({
            mutation: gql`mutation lockNode {
                jcr { 
                    mutateNode(pathOrId: "${path}") {
                        lock
                    }
                }
            }`
        }).should(resp => {
            expect(resp?.data.jcr.mutateNode.lock).to.be.true;
        });
    }

    function assertFileNotExist(path) {
        cy.apollo({
            query: gql`query checkFile {
                jcr {
                    nodeByPath(path: "${path}") {uuid}
                }
            }`,
            errorPolicy: 'ignore'
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).to.be.null;
        });
    }

    after(function () {
        deleteSite(siteKey);
        cy.logout();
    });

    it('checks unlock owner when unlocking', () => {
        cy.login();
        let jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');
        jcontent.getTable().getRowByLabel('content-lockPermissions1').contextMenu().select('Lock');

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        let contextMenu = jcontent.getTable().getRowByLabel('content-lockPermissions1').contextMenu();
        contextMenu.shouldNotHaveItem('Lock');
        contextMenu.shouldHaveItem('Unlock');

        cy.logout();
        cy.login('mathias', 'password');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');
        contextMenu = jcontent.getTable().getRowByLabel('content-lockPermissions1').contextMenu();
        contextMenu.shouldNotHaveItem('Lock');
        contextMenu.shouldNotHaveItem('Unlock');
    });

    it('lets root unlock everything', () => {
        cy.login('mathias', 'password');
        let jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');
        jcontent.getTable().getRowByLabel('content-lockPermissions2').contextMenu().select('Lock');

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        let contextMenu = jcontent.getTable().getRowByLabel('content-lockPermissions2').contextMenu();
        contextMenu.shouldNotHaveItem('Lock');
        contextMenu.shouldHaveItem('Unlock');

        cy.logout();
        cy.login();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');
        contextMenu = jcontent.getTable().getRowByLabel('content-lockPermissions2').contextMenu();
        contextMenu.shouldNotHaveItem('Lock');
        contextMenu.shouldHaveItem('Unlock');
        contextMenu.select('Unlock');

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        contextMenu = jcontent.getTable().getRowByLabel('content-lockPermissions2').contextMenu();
        contextMenu.shouldHaveItem('Lock');
        contextMenu.shouldNotHaveItem('Unlock');
    });

    it('Has empty folder page on locked page', () => {
        lockNode(`/sites/${siteKey}/home/test-pageLock1`);
        JContent.visit(siteKey, 'en', 'pages/home/test-pageLock1').switchToListMode();
        cy.get('[data-type="emptyZone"]').contains('This empty folder is locked');
    });

    it('Has disabled create actions on locked content item', () => {
        const relPath = 'contents/test-contentItemLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create action is disabled');
        cy.get('button[data-sel-role="jnt:paragraph"]').should('be.disabled');
    });

    it('Has disabled create actions on locked content folder', () => {
        const relPath = 'contents/content-folderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="createContent"]').should('be.disabled');
        cy.get('button[data-sel-role="createContentFolder"]').should('be.disabled');
    });

    it('Has disabled create actions on locked empty content folder', () => {
        const relPath = 'contents/content-emptyFolderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="createContent"]').should('be.disabled');
        cy.get('button[data-sel-role="createContentFolder"]').should('be.disabled');
    });

    it('Has disabled create actions on locked media folder', () => {
        const relPath = 'files/test-mediaFolderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        const jcontent = JContent.visit(siteKey, 'en', `media/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="fileUpload"]').should('be.disabled');
        cy.get('button[data-sel-role="createFolder"]').should('be.disabled');
    });

    it('Has disabled create actions on locked empty media folder', () => {
        const relPath = 'files/test-emptyMediaFolderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        const jcontent = JContent.visit(siteKey, 'en', `media/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="fileUpload"]').should('be.disabled');
        cy.get('button[data-sel-role="createFolder"]').should('be.disabled');

        cy.log('DND is disabled');
        cy.get('[data-type="upload"]').should('not.exist');
        cy.get('[data-type="emptyZone"]').selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'testdnd.txt',
            mimeType: 'text/plain',
            lastModified: Date.now()
        }, {action: 'drag-drop'});
        // The wait is very important otherwise the upload will never complete
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        assertFileNotExist(`/sites/${siteKey}/${relPath}/testdnd.txt`);
    });
});
