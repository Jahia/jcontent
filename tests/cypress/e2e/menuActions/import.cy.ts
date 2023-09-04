import {JContent} from '../../page-object';

describe('import', {testIsolation: false}, () => {
    const siteKey = 'jContentSite-import';
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession(); // Edit in chief
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    });

    after(function () {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    beforeEach(function () {
        jcontent.reset();
    });

    it('can import a page', function () {
        const pages = jcontent.getAccordionItem('pages').click();
        pages.getTreeItem('home')
            .contextMenu()
            .select('Import content');
        cy.get('#file-upload-input').selectFile('cypress/fixtures/jcontent/menuActions/test-page.zip', {force: true});
        pages.getTreeItem('home').expand();
        pages.getTreeItem('test');
    });

    it('can import a content in a folder', function () {
        jcontent.getSecondaryNavAccordion().get();
        jcontent.getAccordionItem('content-folders')
            .click()
            .getTreeItem('contents')
            .contextMenu()
            .select('Import content');
        cy.get('#file-upload-input').selectFile('cypress/fixtures/jcontent/menuActions/test-content.zip', {force: true});
        jcontent.getTable().getRowByLabel('import-text');
    });
});
