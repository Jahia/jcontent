import { JContent } from '../page-object'

describe('Create content tests', () => {
    let jcontent: JContent

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', { SITEKEY: 'jcontentSite' })

        cy.apollo({ mutationFile: 'jcontent/createContent.graphql' })
        cy.login() // edit in chief

        JContent.visit('jcontentSite', 'en', 'content-folders/contents')
    })

    after(function () {
        cy.logout()
        cy.executeGroovy('jcontent/deleteSite.groovy', { SITEKEY: 'jcontentSite' })
    })

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('JSESSIONID')
        jcontent = new JContent()
        jcontent.selectAccordion('content-folders')
    })

    it('Can create content', function () {
        jcontent
            .getCreateContent()
            .open()
            .getContentTypeSelector()
            .selectContentType('Content:Basic')
            .selectContentType('Rich text')
            .create()

        /**
         // check that no non-editorial-content can be created via create-menu
         cm.insureContentTypeCanBeCreate(true,"Top Rated", false);

         // create content under folders browser
         ResizableBrowseTree folders = cm.getBrowseTreeContent();
         cm.createContentWithContentEditor("Highlight", new HashMap<String, Object>() {{
            put("jcr:title", "Hello sunshine");
        }});
         assertThat(cm.getContentList().getRow("Hello sunshine").isPresent())
         .withFailMessage("Row with title %s is not present", "Hello sunshine").isTrue();

         //check that no non-editorial content can be created via contextual-menu
         String myFolder = "My folder";
         JContentHeader actionbar = cm.getJContentHeader();
         actionbar.createContentFolder(myFolder);
         folders.openMenu(myFolder).click(Menu.MENU_CREATE_CONTENT);
         cm.insureContentTypeCanBeCreate(false,"Top stories", false);
         */
    })
})
