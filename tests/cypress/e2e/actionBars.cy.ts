import {JContent} from '../page-object/JContent';

describe('test jcontent actionbar', () => {
    it('test actionbar', () => {
        cy.login();
        JContent.visit('digitall', 'en', 'pages/home/about');
        cy.get('div[role="toolbar"]').contains('Refresh');
        JContent.visit('digitall', 'en', 'content-folders/contents');
        cy.get('div[role="toolbar"]').contains('New content folder');
        cy.get('div[role="toolbar"]').contains('New content');
        cy.get('div[role="toolbar"]').contains('Refresh');
        JContent.visit('digitall', 'en', 'media/files');
        cy.get('div[role="toolbar"]').contains('New folder');
        cy.get('div[role="toolbar"]').contains('Upload file(s)');
        cy.get('div[role="toolbar"]').contains('Refresh');
        cy.logout();
    });
});
