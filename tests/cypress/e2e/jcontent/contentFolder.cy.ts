import {JContent, JContentPageBuilder} from '../../page-object';

describe('Content folder', () => {
    let jcontent: JContentPageBuilder;

    before(() => {
        cy.login();
    });

    after(() => {
        cy.logout();
    });

    beforeEach(() => {
        jcontent = JContent
            .visit('digitall', 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('Open content folders correctly', () => {
        jcontent.getAccordionItem('content-folders').click();
        jcontent
        cy.get('span').contains('Content Folder').should('exist');
    });
});
