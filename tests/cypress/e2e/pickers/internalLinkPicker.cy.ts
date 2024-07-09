import {ContentEditor, JContent} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('Internal link picker test', () => {
    const siteKey = 'internalLinkPickerTest';

    const createMainResource = gql`
        mutation addMainResources {
            jcr {
                addMainResource: mutateNode(pathOrId: "/sites/${siteKey}/contents") {
                    addChild(
                        name: "parentMainResource"
                        primaryNodeType: "cent:mainResourceLinkComponentTest"
                        properties: [{name: "jcr:title", language: "en", value: "parentMainResource"}]
                    ) {
                        addChild(
                            name: "mainResourceLinkTest"
                            primaryNodeType: "cent:mainResourceLinkTest"
                            properties: [{name: "jcr:title", language: "en", value: "mainResourceLinkTest"}]
                        ) {
                            uuid
                        }
                        uuid
                    }
                }
                addInternalLink: mutateNode(pathOrId: "/sites/${siteKey}/home") {
                    addChild(
                        name: "myInternalLink"
                        primaryNodeType: "jnt:nodeLink"
                    ) {
                        uuid
                    }
                }
            }
        }
    `;

    before(function () {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);
        cy.apollo({mutation: createMainResource});
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        deleteSite(siteKey);
    });

    // Tests

    it('should be able to pick jmix:mainResource as internal link', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        const pageAccordion = jcontent.getAccordionItem('pages');
        pageAccordion.expandTreeItem('home');
        pageAccordion.getTreeItem('myInternalLink').contextMenu().select('Edit');

        const contentEditor = new ContentEditor();
        cy.get('.moonstone-chip').contains('Internal Link');
        const picker = contentEditor.getPickerField('jnt:nodeLink_j:node').open();
        picker.selectTab('content');
        picker.getTable().getRowByName('mainResourceLinkTest').get().click();
        picker.select(); // This will fail without the fix

        contentEditor.save();
    });
});
