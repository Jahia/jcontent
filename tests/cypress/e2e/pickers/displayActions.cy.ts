import {contentTypes} from '../../fixtures/contentEditor/pickers/contentTypes';
import {assertUtils} from '../../utils/assertUtils';
import {AccordionItem} from '../../page-object/accordionItem';
import {JContent} from '../../page-object/jcontent';
import gql from 'graphql-tag';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Picker tests - Display actions', () => {
    const siteKey = 'pickerDisplayAction';
    let jcontent: JContent;

    before('setup', () => {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        cy.apollo({
            mutationFile: 'contentEditor/pickers/createCustomContent.graphql',
            variables: {contentFolderPath: `/sites/${siteKey}/contents`}
        });
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    after('teardown', () => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should refresh picker dialog', () => {
        const picker = jcontent
            .createContent(contentTypes.editorialpicker.typeName)
            .getPickerField(contentTypes.editorialpicker.fieldNodeType, contentTypes.editorialpicker.multiple)
            .open();

        // Assert components are visible
        assertUtils.isVisible(picker.get());
        assertUtils.isVisible(picker.getSiteSwitcher());
        assertUtils.isVisible(picker.getAccordion());

        cy.log('select a component');
        const contentAccordion: AccordionItem = picker.getAccordionItem('picker-content-folders');
        contentAccordion.click().getHeader()
            .should('be.visible')
            .and('have.attr', 'aria-expanded')
            .and('equal', 'true');
        picker.wait();
        picker.navigateTo(contentAccordion, 'contents/ce-picker-custom-contents');
        contentAccordion.expandTreeItem('ce-picker-custom-contents');
        picker.getTable().getRowByName('test-loc1').get().should('be.visible').click();

        cy.log('add components in the background');
        cy.apollo({mutation: gql`
                mutation addContent {
                    jcr {
                        addFolder: mutateNode(pathOrId: "/sites/${siteKey}/contents") {
                            addChild(name: "refresh1", primaryNodeType: "jnt:contentFolder") {uuid}
                        }
                        addContent: mutateNode(pathOrId: "/sites/${siteKey}/contents/ce-picker-custom-contents") {
                            addChild(name: "refresh2", primaryNodeType: "qant:location", properties: [
                                { name: "jcr:title", language: "en", value: "refresh2" }
                            ]) {uuid}
                        }
                    }
                }
            `});

        cy.log('assert refresh works for nav tree and table and does not change selection on both');
        picker.getRefreshButton().click();
        picker.wait();
        contentAccordion.getTreeItem('ce-picker-custom-contents').shouldBeSelected();
        contentAccordion.getTreeItem('refresh1').should('be.visible');
        picker.getTable().getRowByName('refresh2').should('be.visible');
        picker.getTable().getRowByName('test-loc1')
            .should('be.visible') // Expanded
            .and('have.class', 'moonstone-TableRow-highlighted'); // Selected
    });
});
