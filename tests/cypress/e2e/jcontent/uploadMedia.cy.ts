import {JContent} from '../../page-object';
import {createUser, deleteUser, getNodeByPath, grantRoles} from '@jahia/cypress';

describe('Upload media tests', {numTestsKeptInMemory: 1}, () => {
    let jcontent: JContent;

    const siteKey = 'uploadMediaSite';
    const user = {name: 'editoruser', password: 'password'};

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        createUser(user.name, user.password);
        grantRoles(`/sites/${siteKey}/home`, ['editor'], user.name, 'USER');
    });

    after(function () {
        cy.logout();
        deleteUser(user.name);
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('Can upload, download, rename and delete basic file', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile('testdnd.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            // Find way to trigger hover for 3 dots menu
            // .rename('testdnd-rename.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, download, rename and delete accented file', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile('testdnd.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            // Find way to trigger hover for 3 dots menu
            // .rename('testdnd-éàöäè¨ç.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, download and delete chinese file', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile('这是一个测验.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            // Find way to trigger hover for 3 dots menu
            // .rename('testdnd-rename.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, rename and delete special characters file', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile('\'"[](){}*|/.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .renameAfterUpload('testdnd-rename.txt')
            .download()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, rename and delete file with too much characters in filename', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile(`${'long_'.repeat(30)}filename.txt`)
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .renameAfterUpload('short_filename.txt')
            .download()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can display custom validation error messages', function () {
        /* Filename should start with UploadErrorValidator.TEST_NODE_NAME_PREFIX
         * from jcontent-test-module to trigger validation error */
        const filename = 'uploadConstraintValidation1.txt';

        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        const fileUpload = jcontent.getMedia()
            .open()
            .createFile(filename)
            .dndUpload('div[data-sel-role-card=bootstrap]');

        fileUpload.getUploadMessage('validation constraint1').should('be.visible');
        fileUpload.getUploadMessage('constraint2').should('be.visible');
    });

    const extensionToMimeType = [
        {filename: 'myfile.pdf', mimeType: 'application/pdf'},
        {filename: 'myfile.txt', mimeType: 'text/plain'},
        {filename: 'myfile.hol', mimeType: 'application/octet-stream'}, // Unknown extension: use the fallback MIME type
        {filename: 'myfile', mimeType: 'application/octet-stream'} // No extension: use the fallback MIME type
    ];
    extensionToMimeType.forEach(({filename, mimeType}) => {
        it(`Should get the MIME type '${mimeType}' for the file extension '${filename}' (upload via drag and drop)`, function () {
            cy.loginAndStoreSession();
            jcontent = JContent.visit(siteKey, 'en', 'media/files');
            const file = jcontent.getMedia()
                .open()
                .uploadFileViaDragAndDrop(filename, 'assets/uploadMedia')
                .download();

            // Check the MIME type property in the JCR matches what's expected
            getNodeByPath(`/sites/${siteKey}/files/${filename}/jcr:content`, ['jcr:mimeType']).then(res => {
                expect(res?.data?.jcr?.nodeByPath?.properties[0]?.value).to.eq(mimeType);
            });

            // Clean up
            file.markForDeletion().deletePermanently();
        });
    });
    extensionToMimeType.forEach(({filename, mimeType}) => {
        it(`Should get the MIME type '${mimeType}' for the file extension '${filename} (upload via dialog)'`, function () {
            cy.loginAndStoreSession();
            jcontent = JContent.visit(siteKey, 'en', 'media/files');
            const file = jcontent.getMedia()
                .open()
                .uploadFileViaDialog(filename, 'assets/uploadMedia')
                .download();

            // Check the MIME type property in the JCR matches what's expected
            getNodeByPath(`/sites/${siteKey}/files/${filename}/jcr:content`, ['jcr:mimeType']).then(res => {
                expect(res?.data?.jcr?.nodeByPath?.properties[0]?.value).to.eq(mimeType);
            });

            // Clean up
            file.markForDeletion().deletePermanently();
        });
    });
});
