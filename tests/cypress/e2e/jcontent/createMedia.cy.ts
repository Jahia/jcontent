import {ContentEditor, JContent} from '../../page-object';
import {addNode, createUser, deleteUser, grantRoles} from '@jahia/cypress';

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
        cy.logout();
        deleteUser(user.name);
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
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

    // https://github.com/Jahia/jcontent/issues/1772
    it.skip('Can open created file in advanced mode with preview', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        const menu = jcontent.getMedia()
            .open()
            .createFile('custom_filename.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            .getGridCard().contextMenu();

        menu.selectByRole('edit');

        // Should be possible to open and exit out of advanced mode without breaking
        const ce = ContentEditor.getContentEditor();
        ce.switchToAdvancedMode();
        ce.cancel();
    });

    it('Cannot drag and drop a file to folder if user has no permission', {retries: 3}, () => {
        cy.logout();
        cy.login(user.name, user.password);
        jcontent = JContent.visit(siteKey, 'en', 'media/files/blankFolder');
        cy.get('[data-type="upload"]').should('not.exist');
        cy.get('[data-type="emptyZone"]').should('be.visible');
    });
});
