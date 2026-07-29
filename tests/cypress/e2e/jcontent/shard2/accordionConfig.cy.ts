import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../../page-object';

describe('Accordion tableConfig', () => {
    const siteKey = 'tableconfigtest';

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);
        cy.apollo({mutation: gql`
            mutation {
                jcr {
                    mutateNode(pathOrId: "/sites/${siteKey}/contents") {
                        addChild(name: "test-child", primaryNodeType: "jnt:bigText") {
                            uuid
                        }
                    }
                }
            }
        `});
        cy.loginAndStoreSession();
    });

    beforeEach(() => {
        cy.login();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    describe('tableConfig.columns', () => {
        it('shows columns specified in tableConfig', () => {
            JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();

            cy.get('[data-cm-role="table-content-list-header-cell-name"]').should('exist');
            cy.get('[data-cm-role="table-content-list-header-cell-type"]').should('exist');
            cy.get('[data-cm-role="table-content-list-header-cell-lastModified"]').should('exist');
        });

        it('hides columns not specified in tableConfig', () => {
            JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();

            cy.get('[data-cm-role="table-content-list-header-cell-status"]').should('not.exist');
            cy.get('[data-cm-role="table-content-list-header-cell-createdBy"]').should('not.exist');
        });
    });

    describe('tableConfig.contextualMenu', () => {
        it('shows only actions registered for the custom context menu', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();

            const menu = jcontent.getTable().getRowByName('test-child').contextMenu();
            menu.shouldHaveItem('Edit');
            menu.shouldHaveItem('Export');
        });

        it('does not show actions excluded from the custom context menu', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();

            jcontent.getTable().getRowByName('test-child').contextMenu();
            cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)').should('not.contain.text', 'Delete');
            cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)').should('not.contain.text', 'Copy');
        });
    });

    describe('tableConfig.header.showStatus', () => {
        it('hides content status in the header when showStatus is false', () => {
            JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();
            cy.get('.content-header [data-sel-role="content-status"]', {timeout: 10000}).should('not.exist');
        });

        it('shows content status in the header by default', () => {
            JContent.visit(siteKey, 'en', 'pages/home').switchToListMode();
            cy.get('.content-header [data-sel-role="content-status"]').should('be.visible');
        });
    });
});
