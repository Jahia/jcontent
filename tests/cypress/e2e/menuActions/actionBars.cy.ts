import {JContent} from '../../page-object/jcontent';

describe('test jcontent actionbar', () => {
    it('test actionbar', () => {
        cy.login();
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/about');
        cy.get('div[role="toolbar"]').find('[data-sel-role="refresh"]').should('exist');
        jcontent.selectAccordion('content-folders');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContentFolder"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContent"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="refresh"]').should('exist');
        jcontent.selectAccordion('media');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createFolder"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="fileUpload"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="refresh"]').should('exist');
        cy.logout();
    });
});
