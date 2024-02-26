import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../page-object';

describe('Test accordions', () => {
    before(function () {
        createSite('accordionTest', {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', 'accordionTest');
    });

    after(function () {
        deleteSite('accordionTest');
    });

    it('Check consistencies of RegExp validation pattern', () => {
        cy.apollo({mutation: gql`
            mutation {
                jcr {
                    mutateNode(pathOrId: "/sites/accordionTest/home") {
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
});
