import {JContent} from '../../page-object';
import {Breadcrumb} from '../../page-object/breadcrumb';
import {addNode} from '@jahia/cypress';

describe('Breadcrumb navigation test', () => {
    const siteKey = 'breadCrumbSite';

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        addNode({
            parentPathOrId: `/sites/${siteKey}/home/search-results`,
            name: 'subpageA',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'subpageA', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home/search-results/subpageA`,
            name: 'childpageA',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'childpageA', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ]
        });
        // Create several nested folders
        const folders = ['A', 'B', 'C', 'D'];
        let parentPath = `/sites/${siteKey}/contents`;

        folders.forEach(name => {
            cy.apollo({
                mutationFile: 'jcontent/createContentFolder.graphql',
                variables: {
                    folderName: name,
                    parentPath: parentPath
                }
            });
            parentPath = `${parentPath}/${name}`;
        });
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Display popup when navigating to list and render list view when selected', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        cy.frameLoaded('#page-builder-frame-1');
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-sel-role="view-list"]').should('be.visible').click();
        cy.get('.moonstone-chip').find('span').contains('List of content items').should('be.visible');
        cy.get('h1').contains('article');
        jcontent.shouldBeInMode('List');
    });

    it('Display popup when navigating to list and render parent page when selected', () => {
        JContent.visit('digitall', 'en', 'pages/home/newsroom/news-entry/article/all-organic-foods-network-gains');
        Breadcrumb.findByContent('article').click();
        cy.get('button[data-sel-role="view-parent"]').should('be.visible').click();
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
        Breadcrumb.findByContent('relatedPeople').should('exist');
        Breadcrumb.getBreadcrumbMenu().select('CEOs of The Digital Roundtable');
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

    it('Checks breadcrumb inside content folders', () => {
        JContent.visit(siteKey, 'en', 'content-folders/contents/A/B/C/D');
        Breadcrumb.findByContent('D').should('exist');
        Breadcrumb.getBreadcrumbMenu().select('B');
        Breadcrumb.findByContent('B').should('exist');
        Breadcrumb.findByContent('A').should('exist');
        cy.get('h1').contains('B');
        Breadcrumb.findByContent('contents').click();
        cy.get('h1').contains('contents');
        cy.get('.moonstone-chip').find('span').contains('Content Folder').should('be.visible');
    });

    it('Checks breadcrumb inside media', () => {
        JContent.visit(siteKey, 'en', 'media/files/bootstrap/css');
        Breadcrumb.findByContent('css').should('exist');
        Breadcrumb.findByContent('bootstrap').should('exist').click();
        cy.get('h1').contains('bootstrap');
        cy.get('.moonstone-chip').find('span').contains('Folder').should('be.visible');
    });

    it('Checks breadcrumb inside pages', () => {
        JContent.visit(siteKey, 'en', 'pages/home/search-results/subpageA/childpageA');
        Breadcrumb.findByContent('childpageA').should('exist');
        Breadcrumb.getBreadcrumbMenu().select('Search Results');
        Breadcrumb.findByContent('Search Results').should('exist');
        cy.get('h1').contains('Search Results');
        Breadcrumb.findByContent('Home').click();
        cy.get('h1').contains('Home');
        cy.get('.moonstone-chip').find('span').contains('Page').should('be.visible');
    });
});
