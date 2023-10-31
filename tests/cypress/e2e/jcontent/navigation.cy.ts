import {JContent, JContentPageBuilder} from "../../page-object";
import {createSite, deleteSite, enableModule} from "@jahia/cypress";


describe('Content navigation', () => {

    before(() => {
        createSite('mySite1');
        createSite('mySite2');
        enableModule('jcontent-test-module', 'mySite1');
    });

    after(() => {
        deleteSite('mySite1');
        deleteSite('mySite2');
    });

    beforeEach(() => {
       cy.login();
    });


    it('Should display custom accordion when enabled on site', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        // tests/jahia-module/jcontent-test-module/src/main/resources/javascript/apps/accordionConfig.js
        jcontent.getAccordionItem('accordion-config').getHeader().should('be.visible');
    });

    it('Should not display custom accordion when not enabled on site', () => {
        const jcontent = JContent.visit('mySite2', 'en', 'pages/home');
        jcontent.getAccordionItem('accordion-config').shouldNotExist();
    });
});
