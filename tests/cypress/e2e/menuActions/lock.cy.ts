import {JContent} from '../../page-object';
import gql from 'graphql-tag';

describe('Lock tests', () => {
    const siteKey = 'jContentSite-lock';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/menuActions/createLockContent.graphql'});
    });

    beforeEach(() => {
        cy.loginEditor(); // Edit in chief
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
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    it('Has empty folder page on locked page', () => {
        lockNode(`/sites/${siteKey}/home/test-pageLock1`);
        JContent.visit(siteKey, 'en', 'pages/home/test-pageLock1');
        cy.get('[data-type="emptyZone"]').contains('This empty folder is locked');
    });

    it('Has disabled create actions on locked content item', () => {
        const relPath = 'contents/test-contentItemLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create action is disabled');
        cy.get('button[data-sel-role="jnt:paragraph"]').should('be.disabled');

        cy.log('Right-click create actions is disabled');
        cy.get('[class*="tableWrapper"]').rightclick({force: true});
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="jnt:paragraph"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
    });

    it('Has disabled create actions on locked content folder', () => {
        const relPath = 'contents/content-folderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="createContent"]').should('be.disabled');
        cy.get('button[data-sel-role="createContentFolder"]').should('be.disabled');

        cy.log('Right-click create actions are disabled');
        cy.get('[class*="tableWrapper"]').rightclick({force: true});
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createContentFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createContentFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
    });

    it('Has disabled create actions on locked empty content folder', () => {
        const relPath = 'contents/content-emptyFolderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        JContent.visit(siteKey, 'en', `content-folders/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="createContent"]').should('be.disabled');
        cy.get('button[data-sel-role="createContentFolder"]').should('be.disabled');

        cy.log('Right-click create actions are disabled');
        cy.get('[data-type="emptyZone"]')
            .contains('This empty folder is locked')
            .rightclick({force: true});
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createContentFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createContentFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
    });

    it('Has disabled create actions on locked media folder', () => {
        const relPath = 'files/test-mediaFolderLock1';
        lockNode(`/sites/${siteKey}/${relPath}`);
        const jcontent = JContent.visit(siteKey, 'en', `media/${relPath}`);

        cy.log('header create actions are disabled');
        cy.get('button[data-sel-role="fileUpload"]').should('be.disabled');
        cy.get('button[data-sel-role="createFolder"]').should('be.disabled');

        cy.log('Right-click create actions are disabled');
        jcontent.switchToListMode();
        cy.get('[class*="tableWrapper"]').rightclick({force: true});
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="fileUpload"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
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

        cy.log('Right-click create actions are disabled');
        jcontent.switchToListMode();
        cy.get('[data-type="emptyZone"]')
            .contains('This empty folder is locked')
            .rightclick({force: true});
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="createFolder"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .find('li[data-sel-role="fileUpload"]')
            .should('have.attr', 'aria-disabled')
            .and('equal', 'true');
    });
});
