import {JContent} from '../page-object';
import {Breadcrumb} from '../page-object/breadcrumb';

describe('Breadcrumb navigation test', () => {
    before(function () {
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
    });

    beforeEach(function () {
        cy.loginEditor();
    });

    afterEach(function () {
        cy.logout();
    });

    it('Handles area and parent page navigation correctly', () => {
        let jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        jcontent.switchToPageComposer();
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-list"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Content List').should('be.visible');
        cy.get('h1').contains('article');

        jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        jcontent.switchToPageComposer();
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-parent"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('News Entry');

        Breadcrumb.findByContent('Newsroom').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('Newsroom');
    });
});
