import {JContent, JContentPageComposer} from "../page-object";

describe('jContent header tests', () => {
    let jcontent: JContentPageComposer;
    const path = 'pages/home';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite-header'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite-header'});
    });

    beforeEach(() => {
        cy.loginEditor();
        jcontent = JContent
            .visit('jcontentSite', 'en', path)
            .switchToPageComposer();
    });

    it('Should open preview in new tab', () => {
        let url: string = '';
        cy.window().should(win => {
            cy.stub(win, 'open', (u) => url = u).as('stubOpen')
        });

        jcontent.getHeaderActionButton('openInPreview').click();
        expect('@stubOpen').to.be.called;
        expect(url.includes('cms/render/default')).to.be.true;
        expect(url.endsWith(`${path}.html`)).to.be.true;
    });

    it('Does not show open preview and open live buttons in content folders accordion', () => {
        jcontent.getAccordionItem('content-folders').click();
        jcontent.getHeaderActionButton('openInPreview').should('not.exist');
        jcontent.getHeaderActionButton('openInLive').should('not.exist');
    });

    it('Does not show open preview and open live buttons in media accordion', () => {
        jcontent.getAccordionItem('media').click();
        jcontent.getHeaderActionButton('openInPreview').should('not.exist');
        jcontent.getHeaderActionButton('openInLive').should('not.exist');
    });
})
