import {ContentEditor, JContent} from '../../page-object';
import {addNode, createUser, deleteNode, deleteUser, grantRoles} from '@jahia/cypress';

describe('Create media tests', () => {
    let jcontent: JContent;

    const siteKey = 'jcontentSite';
    const user = {name: 'editoruser', password: 'password'};

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        addNode({
            parentPathOrId: `/sites/${siteKey}/files`,
            primaryNodeType: 'jnt:folder',
            name: 'blankFolder'
        });

        createUser(user.name, user.password);
        grantRoles(`/sites/${siteKey}/home`, ['editor'], user.name, 'USER');
    });

    after(function () {
        deleteUser(user.name);
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    afterEach(() => {
        cy.logout();
    });

    it('Can create and delete basic folder', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFolder('media/files', 'test')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete chinese folder', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFolder('media/files', '这是一个测验')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete reserved word folder', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFolder('media/files', 'sites')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete reserved characters folder', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('jcontentSite', 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createInvalidFolder('media/files', '[]*|/%');
    });

    it('Can open created file in advanced mode with preview', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        const menu = jcontent.getMedia()
            .open()
            .createFile('custom_filename.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            .getGridCard().contextMenu();

        cy.waitUntil(() => menu.selectByRole('edit'));

        // Should be possible to open and exit out of advanced mode without breaking
        const ce = ContentEditor.getContentEditor();
        ce.switchToAdvancedMode();
        ce.cancel();
    });

    it('Cannot drag and drop a file to folder if user has no permission', {retries: 3}, () => {
        cy.loginAndStoreSession(user.name, user.password);
        JContent.visit(siteKey, 'en', 'media/files/blankFolder');
        cy.get('[data-type="upload"]').should('not.exist');
        cy.get('[data-type="emptyZone"]').should('be.visible');
    });

    it('Can replace an existing file when uploading a duplicate', function () {
        const fileName = 'Screenshot 2025-11-14 at 08.02.10.png';

        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        const media = jcontent.getMedia().open();

        // Create folder and navigate into it
        media.createFolder('media/files', 'replaceTest').visitFolder();

        // Upload initial file using existing page object helpers
        media.createFile(fileName).dndUpload('[data-type="upload"]');
        cy.get('[data-cm-role="upload-status-success"]').should('be.visible');
        cy.get('[data-cm-role="upload-close-button"]').click();

        // Upload the same file again — triggers "File already exists" error
        media.createFile(fileName).dndUpload('div[data-sel-role-card]');

        // Verify the error appears and click Replace
        cy.get('[data-sel-role="upload-status"]').should('be.visible');
        cy.get('[data-sel-role="upload-error-msg"]').should('contain', 'File already exists');
        cy.get('[data-sel-role="upload-status"]').contains('button', 'Replace').click();

        // Verify the replace was successful
        cy.get('[data-cm-role="upload-status-success"]').should('be.visible');
        cy.get('[data-cm-role="upload-close-button"]').click();

        // Clean up
        deleteNode(`/sites/${siteKey}/files/replaceTest`);
    });
});
