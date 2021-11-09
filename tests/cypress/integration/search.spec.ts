import { JContent, BasicSearch } from "../page-object";

describe("Search tests", () => {
    let jcontent: JContent;
    let basicSearch: BasicSearch;

    before(function () {
        cy.executeGroovy("jcontent/createSite.groovy", { SITEKEY: "jcontentSite" });

        cy.apollo({ mutationFile: "jcontent/createContent.graphql" });
        cy.login(); // edit in chief

        JContent.visit(
            "jcontentSite",
            "en",
            "content-folders/contents"
        );
    });

    after(function () {
        cy.logout();
        cy.executeGroovy("jcontent/deleteSite.groovy", { SITEKEY: "jcontentSite" });
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('JSESSIONID');
        jcontent = new JContent();
        jcontent.selectAccordion('content-folders');
        basicSearch = jcontent.getBasicSearch().openSearch().reset();
    });

    it("Test basic search in current folder", function () {
        // Try to search digitall in current path then on whole site
        basicSearch
            .searchTerm("test")
            .executeSearch()
            .verifyTotalCount(0);
    });

    it("Test basic search in all site", function () {
        basicSearch
            .searchTerm("test")
            .searchInWholeSite()
            .executeSearch()
            .verifyResults(["test", "test", "test", "test", "test"])
            .verifyTotalCount(5);
    });

    it("Test search with type", function () {
        basicSearch
            .searchTerm("test")
            .searchInWholeSite()
            .selectContentType("Event")
            .executeSearch()
            .verifyResults(["test", "test"])
            .verifyResultType("Event")
            .verifyTotalCount(2);
    });

    it("Test search edit", function () {
        basicSearch
            .searchTerm("test")
            .searchInCurrentPath()
            .executeSearch()
            .verifyTotalCount(0)
            .editQuery()
            .searchInWholeSite()
            .executeSearch()
            .verifyTotalCount(5);
    });

    it("Test search system name", function () {
        basicSearch
            .searchTerm("lookForMeSystemName")
            .searchInWholeSite()
            .executeSearch()
            .verifyResults(["Very Rich text to find with system name"])
            .verifyResultType("Rich text")
            .verifyTotalCount(1);
    });

    it("Test search tags", function () {
        basicSearch
            .searchTerm("tagToLookFor")
            .searchInWholeSite()
            .executeSearch()
            .verifyResults(["Very Rich text to find with tag"])
            .verifyResultType("Rich text")
            .verifyTotalCount(1);
    });

});
