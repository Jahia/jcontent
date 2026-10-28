// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650), FT-033 to FT-034.

import {addNode, context, createSite, createUser, deleteUser, grantRoles} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const siteKey = 'contentListPaginationSite';
const editor = {username: 'contentListPaginationEditor', password: 'password'};
const contentCount = 21;
const rowSelector = '[data-cm-role="table-content-list-row"]';

const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

const openHomeList = (): JContent => {
    const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    jcontent.switchToListMode();
    return jcontent;
};

const setRowsPerPage = (rowsPerPage: number) => {
    cy.get('[data-sel-role="table-pagination-dropdown-rows-per-page"]').click();
    cy.contains('menu.moonstone-menu [role="option"]', new RegExp(`^${rowsPerPage}$`)).click();
};

const goToNextPage = () => {
    cy.get('[data-sel-role="table-pagination-button-next-page"]').click();
};

describe('Content list pagination', () => {
    before(() => {
        removeFixtures();
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
            languages: 'en'
        });
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editor.username, 'USER');

        // An area is not editorial content, so the list of Home shows only the texts inside it.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'area-main',
            primaryNodeType: 'jnt:area',
            children: Array.from({length: contentCount}, (_, i) => ({
                name: `text-${String(i + 1).padStart(2, '0')}`,
                primaryNodeType: 'jnt:text',
                properties: [{name: 'text', value: `Text ${i + 1}`, language: 'en'}]
            }))
        });
    });

    after(() => {
        cy.logout();
        removeFixtures();
    });

    beforeEach(() => {
        // The table is virtualized: only the rows inside the viewport are in the DOM.
        cy.viewport(1280, 1800);
        cy.loginAndStoreSession(editor.username, editor.password);
    });

    it('FT-033: Pagination at 10 rows splits the list', () => {
        context.tag('jcontent', 'pagination', 'page-split');
        openHomeList();
        cy.get(rowSelector).should('have.length', contentCount);

        setRowsPerPage(10);
        cy.get(rowSelector).should('have.length', 10);
        goToNextPage();
        cy.get(rowSelector).should('have.length', 10);
        goToNextPage();

        cy.get(rowSelector).should('have.length', contentCount - 20);
    });

    it('FT-034: A larger page size shows the whole list', () => {
        context.tag('jcontent', 'pagination', 'page-size');
        openHomeList();
        setRowsPerPage(10);
        cy.get(rowSelector).should('have.length', 10);

        setRowsPerPage(50);
        cy.get(rowSelector).should('have.length', contentCount);
        setRowsPerPage(25);
        cy.get(rowSelector).should('have.length', contentCount);
    });
});
