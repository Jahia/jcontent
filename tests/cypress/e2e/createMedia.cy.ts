import {JContent} from '../page-object';

describe('Create media tests', () => {
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginEditor();
        JContent.visit('jcontentSite', 'en', 'media/files');
        jcontent = new JContent();
        jcontent.selectAccordion('media');
    });

    it('Can create and delete basic folder', function () {
        jcontent.getMedia()
            .open()
            .createFolder('media/files', 'test')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete chinese folder', function () {
        jcontent.getMedia()
            .open()
            .createFolder('media/files', '这是一个测验')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete reserved word folder', function () {
        jcontent.getMedia()
            .open()
            .createFolder('media/files', 'sites')
            .visitFolder()
            .visitParent()
            .markForDeletion()
            .deletePermanently();
    });

    it('Can create and delete reserved characters folder', function () {
        jcontent.getMedia()
            .open()
            .createInvalidFolder('media/files', '[]*|/%');
    });

    it('Can upload, download, rename and delete basic file', function () {
        jcontent.getMedia()
            .open()
            .createFile('testdnd.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            .rename('testdnd-rename.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, download, rename and delete accented file', function () {
        jcontent.getMedia()
            .open()
            .createFile('testdnd.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            .rename('testdnd-éàöäè¨ç.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, rename and delete chinese file', function () {
        jcontent.getMedia()
            .open()
            .createFile('这是一个测验.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .download()
            .rename('testdnd-rename.txt')
            .markForDeletion()
            .deletePermanently();
    });

    it('Can upload, rename and delete special characters file', function () {
        jcontent.getMedia()
            .open()
            .createFile('\'"[](){}*|/.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]')
            .renameAfterUpload('testdnd-rename.txt')
            .download()
            .markForDeletion()
            .deletePermanently();
    });
});
