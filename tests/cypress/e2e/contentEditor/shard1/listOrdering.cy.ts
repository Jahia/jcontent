import {ContentEditor, JContent, SidePanel} from '../../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField} from '../../../page-object/fields';

describe('Test list ordering', () => {
    let jcontent: JContent;
    const siteKey = 'listOrderingSite';

    before(() => {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'sololist',
            primaryNodeType: 'jnt:contentList'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'listOrdering',
            primaryNodeType: 'jnt:contentList',
            children: [
                {
                    name: 'order-item1',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', language: 'en', value: 'A'}]
                },
                {
                    name: 'order-item2',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', language: 'en', value: 'B'}]
                },
                {
                    name: 'order-item3',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', language: 'en', value: 'C'}]
                }
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'manualOrdering',
            primaryNodeType: 'qant:simpleListManuallyOrderable',
            children: [
                {
                    name: 'Amanual',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', language: 'en', value: 'Amanual'}]
                }
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'automaticOrdering',
            primaryNodeType: 'qant:simpleListAutomaticallyOrderable',
            children: [
                {
                    name: 'Aautomatic',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', language: 'en', value: 'Aautomatic'}]
                }
            ]
        });
    });

    beforeEach(() => {
        cy.login(); // Edit in chief
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('verifies that list ordering section is available', () => {
        const contentEditor = JContent.visit('digitall', 'en', 'pages/home/investors/events/Events').editContent();
        contentEditor.getSection('listOrdering').should('exist');
    });

    it('should order items', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('listOrdering');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSection('listOrdering').should('exist');
        new SidePanel().switchToPreviewTab();
        contentEditor.validateContentIsVisibleInPreview('ABC');

        cy.log('Switch to automatic ordering');
        cy.get('button#order-item1').should('have.attr', 'data-sel-field-picker-action', 'openPicker');
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]')
            .find('input[type="checkbox"]')
            .click({force: true});

        cy.log('Select ordering by text');
        contentEditor.getField(ChoiceListField, 'jmix:orderedList_firstField').selectValue('text');
        contentEditor.save();
        contentEditor.validateContentIsVisibleInPreview('CBA');

        cy.log('Select order direction: asc');
        contentEditor.getField(ChoiceListField, 'jmix:orderedList_firstDirection').selectValue('asc');
        contentEditor.save();
        contentEditor.validateContentIsVisibleInPreview('ABC');
    });

    it('should not be automatically orderable', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('manualOrdering');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSection('listOrdering').should('exist');
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]', {timeout: 5000}).should('not.exist');
    });

    it('should only be automatically orderable', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('automaticOrdering');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSection('listOrdering').should('exist');
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]').should('exist');
        cy.get('[data-sel-field-picker-action="openPicker"]', {timeout: 5000}).should('not.exist');
    });

    it('should not display sub-nodes', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('sololist');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSection('listOrdering').should('exist');
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]').should('exist');
        cy.get('[data-sel-field-picker-action="openPicker"]', {timeout: 5000}).should('not.exist');
    });
});
