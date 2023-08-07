import {JContent} from '../../page-object';
import {Breadcrumb} from '../../page-object/breadcrumb';

describe('Breadcrumb navigation test', () => {
    before(function () {
        cy.apollo({mutationFile: 'jcontent/enablePageComposer.graphql'});
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Display popup when navigating to list and render list view when selected', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        jcontent.switchToPageBuilder();
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-list"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Content List').should('be.visible');
        cy.get('h1').contains('article');
    });

    it('Display popup when navigating to list and render parent page when selected', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        jcontent.switchToPageBuilder();
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-parent"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('News Entry');
    });

    it('Do not display popup when navigating to page', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry');
        jcontent.switchToPageBuilder();
        Breadcrumb.findByContent('Newsroom').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('Newsroom');
    });

    it('Do not display popup when navigating to list in list view', () => {
        JContent.visit('digitall', 'en', 'pages/home/investors/events/Events/ceos-of-the-digital-roundtable/relatedPeople');
        Breadcrumb.findByContent('CEOs of The Digital Roundtable').click();
        cy.get('.moonstone-chip').find('span').contains('Event').should('be.visible');
    });
});
