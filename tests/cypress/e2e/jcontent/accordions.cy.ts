import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {PageComposer} from '../../page-object/pageComposer';
import {SmallTextField} from '../../page-object/fields';
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
});
