import {JContent} from '../../page-object';

describe('Media sort tests', () => {
    let jcontent: JContent;

    const siteKey = 'mediaSortSite';

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.login();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .open()
            .createFile('abc.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]', 'this should make the file larger than the default 13 bytes');
        jcontent.getMedia()
            .open()
            .createFile('xyz.txt')
            .dndUpload('div[data-sel-role-card=bootstrap]');
        jcontent.getMedia()
            .open()
            .createFolder('media/files', 'zzz');
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('Verifies sort option is only present in grid view', function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia().switchView('list');
        cy.get('button[data-sel-role="sel-media-sort-dropdown"]').should('not.exist');
        jcontent.getMedia().switchView('grid');
        cy.get('button[data-sel-role="sel-media-sort-dropdown"]').should('exist');
    });

    it('Switches sort direction of thumbnails by name', function () {
        // Note that folders always come before files
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .switchView('grid')
            .switchSortProperty('Name')
            .switchSortDirection('Ascending (A-Z)');
        jcontent.getGrid().matchCardNameOrder(['bootstrap', 'zzz', 'abc.txt', 'xyz.txt']);

        jcontent.getMedia()
            .switchView('grid')
            .switchSortDirection('Descending (Z-A)');
        jcontent.getGrid().matchCardNameOrder(['zzz', 'bootstrap', 'xyz.txt', 'abc.txt']);
    });

    it('Switches sort direction of thumbnails by last modified date', function () {
        // Note that folders always come before files
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .switchView('grid')
            .switchSortProperty('Last modified on')
            .switchSortDirection('Ascending (A-Z)');
        jcontent.getGrid().matchCardNameOrder(['bootstrap', 'zzz', 'abc.txt', 'xyz.txt']);

        jcontent.getMedia()
            .switchView('grid')
            .switchSortDirection('Descending (Z-A)');
        jcontent.getGrid().matchCardNameOrder(['zzz', 'bootstrap', 'xyz.txt', 'abc.txt']);
    });

    it('Switches sort direction of thumbnails by size', function () {
        // Note that folders always come before files
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia()
            .switchView('grid')
            .switchSortProperty('Size')
            .switchSortDirection('Ascending (A-Z)');
        jcontent.getGrid().matchCardNameOrder(['bootstrap', 'zzz', 'xyz.txt', 'abc.txt']);

        jcontent.getMedia()
            .switchView('grid')
            .switchSortDirection('Descending (Z-A)');
        jcontent.getGrid().matchCardNameOrder(['bootstrap', 'zzz', 'abc.txt', 'xyz.txt']);
    });
});
