import {JContent} from "../page-object";

describe("Search tests", () => {
    beforeEach(function () {
        cy.executeGroovy("jcontent/createSite.groovy", {SITEKEY: "jcontentSite"});
        cy.apollo({mutationFile: "jcontent/createContent.graphql"});
        cy.login(); // edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy("jcontent/deleteSite.groovy", {SITEKEY: "jcontentSite"});
    });

    it("Test basic search", function () {
        const jcontent = JContent.visit(
            "jcontentSite",
            "en",
            "content-folders/contents"
        );
        const basicSearch = jcontent.getBasicSearch();

        // Try to search digitall in current path then on whole site
        basicSearch
            .openSearch()
            .searchTerm("test")
            .executeSearch()
            .verifyTotalCount(0);

        basicSearch
            .editQuery()
            .searchInWholeSite()
            .executeSearch()
            .verifyResults(["test", "test", "test", "test", "test"])
            .verifyTotalCount(5);

        basicSearch
            .editQuery()
            .searchTerm("test")
            .selectContentType("Event")
            .executeSearch()
            .verifyResults(["test", "test"])
            .verifyResultType("Event", "jnt:event")
            .verifyTotalCount(2);

        basicSearch
            .editQuery()
            .searchInCurrentPath()
            .executeSearch()
            .verifyTotalCount(0);

        basicSearch
            .editQuery()
            .searchTerm("Company")
            .executeSearch()
            .verifyTotalCount(0);

        basicSearch
            .editQuery()
            .searchInWholeSite()
            .executeSearch()
            .verifyTotalCount(0);
    });
});
