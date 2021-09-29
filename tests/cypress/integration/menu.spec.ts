import {JContent} from "../page-object";

describe("Menu tests", () => {
    beforeEach(function () {
        cy.executeGroovy("jcontent/createSite.groovy", {SITEKEY: "jcontentSite"});
        cy.apollo({mutationFile: "jcontent/createContent.graphql"});
        cy.login(); // edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy("jcontent/deleteSite.groovy", {SITEKEY: "jcontentSite"});
    });

    it("Can edit content", function () {
        const jcontent = JContent.visit("jcontentSite", "en", "pages/home");
        jcontent.getTable().getRowByIndex(1).contextMenu().select("Delete");

        cy.contains(".x-btn-text", "No").click();
    });
});
