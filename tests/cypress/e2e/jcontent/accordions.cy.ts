import {createSite, createUser, deleteSite, deleteUser, enableModule, grantRoles} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../page-object';

describe('Test accordions', () => {
    const siteKey = 'accordionTest';
    const editor = {username: 'accordionEditor', password: 'password'};

    before(function () {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);

        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}/home`, ['editor'], editor.username, 'USER');
    });

    after(function () {
        deleteSite(siteKey);
        deleteUser(editor.username);
        cy.logout();
    });

    it('Check consistencies of RegExp validation pattern', () => {
        cy.apollo({mutation: gql`
            mutation {
                jcr {
                    mutateNode(pathOrId: "/sites/${siteKey}/home") {
                        addChild(name: "test", primaryNodeType: "cent:visibleInTree") {
                            uuid
                        }
                    }
                }
            }`});
        cy.login();
        const jc = JContent.visit('accordionTest', 'en', 'pages/home');
        jc.getAccordionItem('pages').getTreeItem('home').expand();
        jc.getAccordionItem('pages').getTreeItem('test');
    });

    it('Adds and displays accordion without permission', () => {
        cy.login();
        const jc = JContent.visit('accordionTest', 'en', 'pages/home');
        cy.window().then(win => {
            win.eval(`window.jahia.uiExtender.registry.add('accordionItem', 'testmoduleApps_Example', window.jahia.uiExtender.registry.get('accordionItem', 'renderDefaultApps'), {
                    targets: ['jcontent:998'],
                    label: 'new-accordion',
                    appsTarget: 'testmoduleaccordion',
                    isEnabled: function(siteKey) {
                        return siteKey !== 'systemsite'
                    }
                });`
            );
            jc.getAccordionItem('pages').getTreeItem('home').expand();
            jc.getAccordionItem('testmoduleApps_Example').click();
        });
    });

    it('Displays accordion for user with editor permission on home page', () => {
        cy.login(editor.username, editor.password);
        JContent.visit(siteKey, 'en', 'pages/home');
        cy.get('li[data-registry-key="primary-nav-item:jcontent"]').should('be.visible');
    });
});
