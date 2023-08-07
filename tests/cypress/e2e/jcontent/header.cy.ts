import {JContent} from '../../page-object';

describe('jContent header tests', () => {
    let jcontent: JContent;
    const siteKey = 'jcontentSite-header';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite-header'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    });

    function getHeaderSelector(role) {
        return `.moonstone-header button[data-sel-role="${role}"]`;
    }

    it('Should open preview in new tab', () => {
        const language = 'en';
        cy.window().then(win => {
            cy.stub(win, 'open', url => {
                expect(url.includes(`cms/render/default/${language}`, `url: ${url}`)).to.be.true;
                expect(url.endsWith(`${siteKey}/home.html`), `url: ${url}`).to.be.true;
            });
        });
        jcontent.getHeaderActionButton('openInPreview').click();
    });

    it.only('Should open preview in french in new tab', () => {
        const language = 'fr';
        jcontent = JContent.visit('digitall', 'en', 'pages/home');
        jcontent.getLanguageSwitcher().select('fr');
        cy.window().then(win => {
            cy.stub(win, 'open', url => {
                expect(url.includes(`cms/render/default/${language}`, `url: ${url}`)).to.be.true;
                expect(url.endsWith('digitall/home.html'), `url: ${url}`).to.be.true;
            });
        });
        jcontent.getHeaderActionButton('openInPreview').click();
    });

    it('Does not show open preview and open live buttons in content folders accordion', () => {
        jcontent.getAccordionItem('content-folders').click();
        jcontent.getHeaderActionButton('publishAll').should('exist'); // Verify header is loaded first
        cy.get(getHeaderSelector('openInPreview'), {timeout: 5000}).should('not.exist');
        cy.get(getHeaderSelector('openInLive'), {timeout: 5000}).should('not.exist');
    });

    it('Does not show open preview and open live buttons in media accordion', () => {
        jcontent.getAccordionItem('media').click();
        jcontent.getHeaderActionButton('publishAll').should('exist'); // Verify header is loaded first
        cy.get(getHeaderSelector('openInPreview'), {timeout: 5000}).should('not.exist');
        cy.get(getHeaderSelector('openInLive'), {timeout: 5000}).should('not.exist');
    });
});
