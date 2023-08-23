import {JContent, BasicSearch} from '../../page-object';

describe('Search tests', () => {
    let jcontent: JContent;
    let basicSearch: BasicSearch;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    describe('from jcontent', {testIsolation: false}, () => {
        before(() => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit('jcontentSite', 'en', 'content-folders/contents');
        });

        beforeEach(() => {
            basicSearch = jcontent.getBasicSearch().openSearch().reset();
        });

        afterEach(() => {
            basicSearch.close();
        });

        it('Test basic search in current folder', function () {
            // Try to search digitall in current path then on whole site
            basicSearch.searchTerm('test').executeSearch().verifyTotalCount(0);
        });

        it('Test basic search in all site', function () {
            basicSearch
                .searchTerm('test')
                .searchInWholeSite()
                .executeSearch()
                .verifyResults(['test', 'test', 'test', 'test', 'test'])
                .verifyTotalCount(5);
        });

        it('Test search with type', function () {
            basicSearch
                .searchTerm('test')
                .searchInWholeSite()
                .selectContentType('Event')
                .executeSearch()
                .verifyResults(['test', 'test'])
                .verifyResultType('Event')
                .verifyTotalCount(2);
        });

        it('Test search edit', function () {
            basicSearch
                .searchTerm('test')
                .searchInCurrentPath()
                .executeSearch()
                .verifyTotalCount(0)
                .editQuery()
                .searchInWholeSite()
                .executeSearch()
                .verifyTotalCount(5);
        });

        it('Test search system name', function () {
            basicSearch
                .searchTerm('lookForMeSystemName')
                .searchInWholeSite()
                .executeSearch()
                .verifyResults(['Very Rich text to find with system name'])
                .verifyResultType('Rich text')
                .verifyTotalCount(1);
        });

        it('Test search tags', function () {
            basicSearch
                .searchTerm('tagToLookFor')
                .searchInWholeSite()
                .executeSearch()
                .verifyResults(['Very Rich text to find with tag'])
                .verifyResultType('Rich text')
                .verifyTotalCount(1);
        });
    });

    describe('after close', () => {
        it('should go back to content-folders after close', () => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit('jcontentSite', 'en', 'content-folders/contents');
            jcontent.getBasicSearch().openSearch().searchTerm('test').executeSearch().close();
            jcontent.getAccordionItem('content-folders').getTreeItem('contents').shouldBeSelected();
            jcontent.shouldBeInMode('List');
        });

        it('should go back to pages after close', () => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
            jcontent.getBasicSearch().openSearch().searchTerm('test').executeSearch().close();
            jcontent.getAccordionItem('pages').getTreeItem('home').shouldBeSelected();
            jcontent.shouldBeInMode('Page Builder');
        });

        it('should go back to default', () => {
            cy.loginAndStoreSession();
            cy.visit('/jahia/jcontent/jcontentSite/en/search/sites/jcontentSite/contents?params=(searchContentType:%27%27,searchPath:/sites/digitall/home,searchTerms:test)');
            jcontent = new JContent();
            new BasicSearch(jcontent).close();
            jcontent.getAccordionItem('pages').getTreeItem('home').shouldBeSelected();
            jcontent.shouldBeInMode('Page Builder');
        });
    });

    describe.only('advanced search', {testIsolation: false}, () => {
        before(() => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit('jcontentSite', 'en', 'content-folders/contents');
        });

        it('should find event by from ', () => {
            jcontent.selectAccordion('pages');
            basicSearch = jcontent.getBasicSearch().openSearch().switchToAdvanced()
                .searchFrom('jnt:event')
                .executeSearch()
                .sortBy('name')
                .verifyResults(['test-content5', 'test-content4'])
                .verifyResultType('Event');
        });
    });
});
