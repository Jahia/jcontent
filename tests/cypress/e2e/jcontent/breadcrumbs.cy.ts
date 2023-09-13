import {JContent} from '../../page-object';
import {Breadcrumb} from '../../page-object/breadcrumb';

describe('Breadcrumb navigation test', () => {
    before(function () {
        cy.loginAndStoreSession();
        JContent.visit('digitall', 'en', 'pages/home');
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Display popup when navigating to list and render list view when selected', () => {
        JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-list"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Content List').should('be.visible');
        cy.get('h1').contains('article');
    });

    it('Display popup when navigating to list and render parent page when selected', () => {
        JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-cm-role="breadcrumb-view-parent"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('News Entry');
    });

    it('Do not display popup when navigating to page', () => {
        JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry');
        Breadcrumb.findByContent('Newsroom').click();
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
        cy.get('h1').contains('Newsroom');
    });

    it('Do not display popup when navigating to list in list view', () => {
        JContent.visit('digitall', 'en', 'pages/home/investors/events/Events/ceos-of-the-digital-roundtable/relatedPeople');
        Breadcrumb.findByContent('CEOs of The Digital Roundtable').click();
        cy.get('.moonstone-chip').find('span').contains('Event').should('be.visible');
    });

    it('Display same items as tree content selection', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        jcontent.switchToListMode();

        // Get total rows
        cy.get('[data-sel-role="table-pagination-total-rows"]')
            .invoke('text')
            .then(e => {
                // Get total rows through regex e.g. extract 21 from "1-21 of 21"
                const totalRows = e.match(/of (.*)$/)?.[1];
                cy.wrap(totalRows).as('totalRows');
            });

        JContent.visit('digitall', 'en', 'pages/home/area-main/highlights');
        Breadcrumb.findByContent('Home').click();
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');

        cy.get('@totalRows').then(totalRows => {
            cy.get('[data-sel-role="table-pagination-total-rows"]')
                .invoke('text')
                .should('contain', totalRows);
        });
    });
});
