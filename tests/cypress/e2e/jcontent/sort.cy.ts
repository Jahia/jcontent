import {JContent} from '../../page-object';

describe('Table sorting tests', () => {
    let jcontent: JContent;

    const siteKey = 'sortingTestsSite';

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.login();
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('Can sort files by type', function () {
        const extensionToMimeType = [
            {filename: 'myfile.pdf', mimeType: 'application/pdf'},
            {filename: 'myfile.txt', mimeType: 'text/plain'},
            {filename: 'myfile.hol', mimeType: 'application/octet-stream'}
        ];
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .uploadFileViaDragAndDrop(extensionToMimeType[0].filename, 'assets/uploadMedia')
            .download();
        jcontent.getMedia()
            .open()
            .uploadFileViaDragAndDrop(extensionToMimeType[1].filename, 'assets/uploadMedia')
            .download();
        jcontent.getMedia()
            .open()
            .uploadFileViaDragAndDrop(extensionToMimeType[2].filename, 'assets/uploadMedia')
            .download();

        jcontent.switchToListMode();
        const header = jcontent.getTable().getHeaderByRole('type');
        header.sort();
        jcontent.getTable().getRowByIndex(2).element.contains('myfile.txt');
        jcontent.getTable().getRowByIndex(2).element.contains('text/plain');
        header.sort();
        jcontent.getTable().getRowByIndex(2).element.contains('myfile.hol');
        jcontent.getTable().getRowByIndex(2).element.contains('application/octet-stream');
    });
});
