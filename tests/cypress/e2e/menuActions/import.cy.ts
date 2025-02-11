import {JContent} from '../../page-object';

describe('import', {testIsolation: false}, () => {
    const siteKey = 'jContentSite-import';

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    it('can import a page', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile('cypress/fixtures/jcontent/menuActions/test-page.zip', {force: true});
        jcontent.getAccordionItem('pages').expandTreeItem('home');
        jcontent.getAccordionItem('pages').getTreeItem('test');
    });

    it('can import a content in a folder', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile('cypress/fixtures/jcontent/menuActions/test-content.zip', {force: true});
        jcontent.getTable().getRowByLabel('import-text');
    });
});
