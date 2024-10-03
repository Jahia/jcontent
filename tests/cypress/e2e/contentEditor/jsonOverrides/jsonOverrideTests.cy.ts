import {JContent} from '../../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {Field, SmallTextField} from '../../../page-object/fields';

describe('json override tests', {testIsolation: false}, () => {
    const siteKey = 'contentEditorSite';
    const moduleName = 'jcontent-test-module';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'contentEditor/overrideTests/references.graphql'});
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
    });

    it('can hide advancedMode button with json override', () => {
        enableModule(moduleName, siteKey);
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.editComponentByText('test-content1');
        cy.get('button[data-sel-role="advancedMode"]').should('not.exist');
    });

    it('can support json overrides', () => {
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByText('json overrides');

        cy.log('Test custom section, label and expanded by default');
        const section = contentEditor.getSection('My custom section label');
        section.shouldBeExpanded();
        section.get().scrollIntoView();
        // Verify fields have been moved in the specified section
        section.getField('cent:testJsonOverrides_valueConstraintField').should('exist');

        cy.log('Test hide section');
        cy.get('div[data-sel-content-editor-fields-group="SEO"]').should('not.exist');

        cy.log('Test read only field');
        const readOnly = contentEditor.getField(SmallTextField, 'cent:testJsonOverrides_readOnlyField');
        readOnly.checkValue('read only text');
        readOnly.isReadOnly();

        cy.log('Test hide field');
        cy.get('div[data-sel-content-editor-field="cent:testJsonOverrides_hideField"]')
            .should('not.exist', {timeout: 10000});

        cy.log('Test mandatory field');
        contentEditor.getField(Field, 'cent:testJsonOverrides_mandatoryField').hasMandatory();

        cy.log('Test field rank');
        contentEditor.getSection('My custom section label').get()
            .find('[data-sel-content-editor-field]').first()
            .should('have.attr', 'data-sel-content-editor-field', 'cent:testJsonOverrides_valueConstraintField');
        contentEditor.getSection('My custom section label').get()
            .find('[data-sel-content-editor-field]').last()
            .should('have.attr', 'data-sel-content-editor-field', 'cent:testJsonOverrides_mandatoryField');

        cy.log('Test field constraints');
        contentEditor.getField(SmallTextField, 'cent:testJsonOverrides_valueConstraintField').addNewValue('1234');
        contentEditor.save(false);
        cy.get('[data-sel-role=dialog-errorBeforeSave]').contains('valueConstraintField');
        cy.get('[data-sel-role=dialog-errorBeforeSave]').contains('mandatoryField');
        cy.get('[data-sel-role="content-type-dialog-cancel"]').click();

        cy.log('Test picker override');
        const picker = contentEditor.getPickerField('cent:testJsonOverrides_pickerOverrideField', false).open();
        picker.assertHasNoSiteSwitcher();
        picker.assertHasNoDisplaySearch();
        picker.get().find('header').should('contain', 'Show current path');

        const accordion = picker.getAccordionItem('picker-pages');
        accordion.getHeader().should('contain', 'News in pages');
        accordion.getTreeItem('test-page1').get().should('be.visible');
        accordion.getTreeItem('test-page2').get().should('be.visible');

        picker.getTable().getHeaderById('name').should('be.visible');
        picker.getTable().getHeaderById('type').should('not.exist');

        picker.getTableRow('Page test 1').should('be.visible').click();
        picker.select();
    });

    it('can hide preview in advanced mode with json override', () => {
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByText('json overrides');
        contentEditor.switchToAdvancedMode();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
    });

    it('supports default value override on create', () => {
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('testJsonOverrides');

        cy.log('Test default value');
        const defaultValue = contentEditor.getField(SmallTextField, 'cent:testJsonOverrides_defaultValueField');
        defaultValue.checkValue('json override default value');
    });

    it('can restore advanced mode button when module is undeployed', () => {
        cy.apollo({
            mutationFile: 'contentEditor/overrideTests/undeployModule.graphql',
            variables: {moduleName, pathOrId: `/sites/${siteKey}`}
        });
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.editComponentByText('test-content1');
        cy.get('button[data-sel-role="advancedMode"]').should('exist');
    });
});

