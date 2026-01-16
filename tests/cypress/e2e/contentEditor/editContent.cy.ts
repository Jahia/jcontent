import {ContentEditor, JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Create content tests', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorSite';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'contentEditor/references.graphql'});
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'AllFieldsSimple',
            primaryNodeType: 'qant:allFields',
            properties: [{name: 'sharedSmallText', value: 'Initial text', language: 'en'}, {name: 'sharedTextarea', value: 'Initial text in area', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'My simple text',
            primaryNodeType: 'jnt:text'
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    const fieldsWithoutBadge = [
        'qant:allFields_smallText', 'qant:allFields_textarea', 'qant:allFields_sharedSmallText', 'qant:allFields_sharedTextarea'
    ];

    it('can edit content', () => {
        jcontent.getTable().getRowByLabel('Rich text').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        cy.get('.moonstone-chip').contains('Rich text');
        contentEditor.getField(RichTextField, 'jnt:bigText_text');
        contentEditor.cancel();
    });

    it('can edit source ref', () => {
        jcontent.getTable().getRowByLabel('Content reference').contextMenu().select('Go to source');
        const contentEditor = new ContentEditor();
        contentEditor.getField(RichTextField, 'jnt:bigText_text');
        contentEditor.cancel();
    });

    it('Updates unsaved badge', () => {
        jcontent.editComponentByRowName('My simple text');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        // Check unsaved badge is not displayed
        cy.get('div[data-sel-role="unsaved-info-chip"]', {timeout: 5000}).should('not.exist');

        // Update content
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('My simple text updated');
        // Check unsaved badge is displayed
        cy.get('div[data-sel-role="unsaved-info-chip"]', {timeout: 5000}).should('exist');

        contentEditor.save();
        // Check unsaved badge is not displayed
        cy.get('div[data-sel-role="unsaved-info-chip"]', {timeout: 5000}).should('not.exist');
    });

    it('Checks "shared by all languages" badge', () => {
        jcontent.editComponentByRowName('AllFieldsSimple');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        // Check "shared by all languages" badge is NOT displayed on non internationalized fields
        fieldsWithoutBadge.forEach(field => {
            cy.get(`[data-sel-content-editor-field="${field}"]`)
                .find('.moonstone-chip')
                .should('not.exist');
        });
        contentEditor.cancel();
    });
});
