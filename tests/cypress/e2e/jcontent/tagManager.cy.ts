import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';

describe('Tag Manager', () => {
    const siteKey = 'tagManagerTest';
    const contentRootPath = `/sites/${siteKey}/contents/tagmanager-e2e`;
    const specialTag = 'ù^$ùç_"(_çt"à\'çr(';
    const commonTag = 'tm-e2e-common';
    const alphaTag = 'tm-e2e-alpha';

    const visitTagManager = () => {
        JContent.visit(siteKey, 'en', 'apps/tagsmanager');
        cy.get('[data-cm-role="tag-manager-root"]').should('be.visible');
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('tags', siteKey);

        GraphqlUtils.addNode(`/sites/${siteKey}/contents`, 'jnt:contentList', 'tagmanager-e2e');
        GraphqlUtils.addNode(contentRootPath, 'jnt:contentList', 'alpha');
        GraphqlUtils.addNode(contentRootPath, 'jnt:contentList', 'beta');
        GraphqlUtils.addNode(contentRootPath, 'jnt:contentList', 'gamma');

        GraphqlUtils.setProperty(`${contentRootPath}/alpha`, 'jcr:title', 'Tag Alpha', 'en');
        GraphqlUtils.setProperty(`${contentRootPath}/beta`, 'jcr:title', 'Tag Beta', 'en');
        GraphqlUtils.setProperty(`${contentRootPath}/gamma`, 'jcr:title', 'Tag Gamma', 'en');

        GraphqlUtils.addMixins(`${contentRootPath}/alpha`, ['jmix:tagged']);
        GraphqlUtils.addMixins(`${contentRootPath}/beta`, ['jmix:tagged']);
        GraphqlUtils.addMixins(`${contentRootPath}/gamma`, ['jmix:tagged']);

        GraphqlUtils.setProperties(`${contentRootPath}/alpha`, 'j:tagList', [alphaTag, commonTag], 'en');
        GraphqlUtils.setProperties(`${contentRootPath}/beta`, 'j:tagList', [commonTag], 'en');
        GraphqlUtils.setProperties(`${contentRootPath}/gamma`, 'j:tagList', [specialTag], 'en');
    });

    after(() => {
        GraphqlUtils.deleteNode(contentRootPath);
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('supports view usages, rename and delete for special-character tags', () => {
        const jc = JContent.visit(siteKey, 'en', 'pages/home');
        jc.getAccordionItem('apps').click();
        jc.getAccordionItem('apps').getTreeItem('tagsmanager').get().should('be.visible');
        jc.getAccordionItem('apps').getTreeItem('tagsmanager').click();

        cy.get('[data-cm-role="tag-manager-root"]').should('be.visible');
        cy.get('.moonstone-header').should('contain', 'Tag manager');

        cy.get('[data-cm-role="tag-manager-search"]').find('input').clear().type('ù^$ùç_');
        cy.contains('[data-cm-role="tag-manager-row"]', specialTag)
            .should('be.visible')
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-view"]').click();
            });

        cy.get('[data-cm-role="tag-manager-drawer"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-drawer"]').should('contain', 'Tag Gamma');

        cy.get('[data-cm-role="tag-manager-drawer-layer"]').click(10, 10);
        cy.get('[data-cm-role="tag-manager-drawer"]').should('not.exist');

        cy.contains('[data-cm-role="tag-manager-row"]', specialTag)
            .should('be.visible')
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-rename"]').click();
            });

        cy.get('[data-cm-role="tag-manager-rename-dialog"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-rename-input"]').find('input').clear().type('tm-e2e-special-renamed');
        cy.get('button[data-cm-role="tag-manager-confirm-rename"]').click();

        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-special-renamed').should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', specialTag).should('not.exist');

        cy.get('[data-cm-role="tag-manager-search"]').find('input').clear().type('tm-e2e-special-renamed');
        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-special-renamed')
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-delete"]').click();
            });

        cy.get('[data-cm-role="tag-manager-delete-dialog"]').should('be.visible');
        cy.get('button[data-cm-role="tag-manager-confirm-delete"]').click();
        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-special-renamed').should('not.exist');
    });

    it('renames a tag on a single content item from the side panel', () => {
        visitTagManager();

        cy.get('[data-cm-role="tag-manager-search"]').find('input').clear().type(alphaTag);
        cy.contains('[data-cm-role="tag-manager-row"]', alphaTag)
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-view"]').click();
            });

        cy.get(`[data-cm-role="tag-manager-drawer-item"][data-node-path="${contentRootPath}/alpha"]`)
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-edit-node-tag"]').click();
            });

        cy.get('[data-cm-role="tag-manager-edit-node-dialog"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-edit-node-input"]').find('input').clear().type('tm-e2e-alpha-local');
        cy.get('button[data-cm-role="tag-manager-confirm-edit-node"]').click();

        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-alpha-local').should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', alphaTag).should('not.exist');
        cy.get('[data-cm-role="tag-manager-drawer"]').should('not.exist');
    });

    it('renames and deletes a site tag from the table', () => {
        visitTagManager();

        cy.get('[data-cm-role="tag-manager-search"]').find('input').clear().type(commonTag);
        cy.contains('[data-cm-role="tag-manager-row"]', commonTag)
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-rename"]').click();
            });

        cy.get('[data-cm-role="tag-manager-rename-dialog"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-rename-input"]').find('input').clear().type('tm-e2e-renamed');
        cy.get('button[data-cm-role="tag-manager-confirm-rename"]').click();

        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-renamed').should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', commonTag).should('not.exist');

        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-renamed')
            .within(() => {
                cy.get('button[data-cm-role="tag-manager-delete"]').click();
            });

        cy.get('[data-cm-role="tag-manager-delete-dialog"]').should('be.visible');
        cy.get('button[data-cm-role="tag-manager-confirm-delete"]').click();
        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-e2e-renamed').should('not.exist');
    });
});
