import {JContent} from '../../page-object';
import {ChoiceListField, Field, SmallTextField} from '../../page-object/fields';
import {
    addNode,
    Button,
    createSite,
    Dropdown,
    enableModule,
    getComponentByRole,
    getComponentBySelector,
    grantRoles
} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor} from '../../page-object';

describe('Content editor form', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorSite';

    before(function () {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        enableModule('qa-module', siteKey);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], 'anne', 'USER');
        grantRoles(`/sites/${siteKey}`, ['editor'], 'mathias', 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'myText',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'my text'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'alwaysActivatedOverrideTest',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', language: 'en', value: 'isAlwaysActivated override test'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsSimple',
            primaryNodeType: 'qant:allFields'
        });
    });

    after(function () {
        cy.runProvisioningScript({
            script: {fileContent: '- startBundle: "jcontent-test-module"', type: 'application/yaml'}
        });
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
    });

    function setDefaultSiteTemplate(templateName) {
        cy.apollo({
            mutation: gql`
                mutation setDefaultTemplate {
                    jcr {
                        mutateNode(pathOrId:"/sites/${siteKey}") {
                            mutateProperty(name:"j:defaultTemplateName") {
                                setValue(value:"${templateName}")
                            }
                        }
                    }
                }`
        }).should(resp => {
            expect(resp?.data?.jcr?.mutateNode.mutateProperty.setValue).to.be.true;
        });
    }

    it('should display custom title label and error message', function () {
        const contentEditor = jcontent.createContent('cent:testOverride');
        const field = contentEditor.getField(SmallTextField, 'cent:testOverride_jcr:title', false);

        field.get().find('label').should('contain', 'My title 1234');

        field.get().find('span').should('contain', 'Custom title');
        field.get().find('span em').should('exist').and('contain', 'italic');
        field.get().find('span script').should('not.exist');

        field.addNewValue('123456789012', true);
        getComponentByRole(Button, 'createButton').click();
        cy.get('[data-sel-role=dialog-errorBeforeSave]').contains('My title 1234');
        getComponentByRole(Button, 'content-type-dialog-cancel').click();
        cy.contains('My constraint message 1234');
    });

    it('should display overridden title label for boolean buttons', function () {
        const contentEditor = jcontent.createContent('cent:mesiHeaderBanner');
        const field = contentEditor.getField(Field, 'cemix:mesiBannerStory_buttonTransverse', false);
        field.get().find('label').should('contain', 'Contribuer le bouton transverse Header ?');
    });

    it('should display overridden property in correct section', function () {
        jcontent.createContent('cent:myComponent');
        cy.get('article').contains('myComponent').parents('article').find('div[data-sel-content-editor-field]').should('have.length', 2);
        cy.get('article').contains('categorizedContent').parents('article').find('div[data-sel-content-editor-field]').should('have.length', 2).as('categorizedContentFields');
        cy.get('@categorizedContentFields').first().should('contain.text', 'category');
        cy.get('@categorizedContentFields').last().should('contain.text', 'subcategory');
    });

    it('should update dependent property "j:subNodesView" in content retrieval when changing "j:type"', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        contentEditor.openSection('layout');
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().find('.moonstone-menuItem').should('have.length', 1).first().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="cent:contentRetrievalCETest_j:type"]').select('News entry');
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().find('.moonstone-menuItem').should('have.length', 13).first().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').select('medium');
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="cent:contentRetrievalCETest_j:type"]').select('Person portrait');
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').get().find('.moonstone-menuItem').should('have.length', 6).first().click();
        getComponentBySelector(Dropdown, '[data-sel-content-editor-field="jmix:renderableList_j:subNodesView"]').select('condensed');
        contentEditor.cancelAndDiscard();
    });

    it.only('should use site default template value', () => {
        const contentTypeName = 'cent:testDefaultTemplate';
        const templateName = 'events';
        const fieldName = 'cent:testDefaultTemplate_j:templateName';

        cy.log('Set default template value for site');
        setDefaultSiteTemplate(templateName);

        cy.log('Verify default template is selected by default and is read-only');
        const contentEditor = jcontent.createContent(contentTypeName);
        const field = contentEditor.getChoiceListField(fieldName);
        field.assertSelected(templateName);
        field.isReadOnly();

        contentEditor.create(); // No errors on create
    });

    it('should display hidden property with overridden hide flag', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_j:invalidLanguagesHiddenTest', true);
        field.addNewValue('fr', true);
        field.addNewValue('de', true);
        contentEditor.create();
        jcontent.editComponentByText('contentRetrievalCETest');
        const fieldEdit = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_j:invalidLanguagesHiddenTest', true);
        fieldEdit.checkValues(['fr', 'de']);
    });

    it('should display overridden title label and description label from json overrides define by labelKey and descriptionKey', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_jcr:title', false);
        field.get().find('label').should('contain', 'Title JSON override');
        field.get().scrollIntoView().contains('Information').should('be.visible');
    });

    it('should display overridden system name and description labels from json overrides', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'nt:base_ce:systemName', false);
        field.get().find('label').should('contain', 'Customized system name');
        field.get().scrollIntoView().contains('Customized description').should('be.visible');
    });

    it('should enable automatically cemix:testAutoActivatedMixin on jnt:bigText for create', () => {
        const contentEditor = jcontent.createContent('jnt:bigText');
        contentEditor.getField(SmallTextField, 'cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField');
        contentEditor.getField(SmallTextField, 'cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField');
    });

    it('should enable automatically cemix:testAutoAlwaysActivatedMixin on jnt:bigText for edit', () => {
        const contentEditor = jcontent.editComponentByText('isAlwaysActivated override test');
        cy.get('[data-sel-content-editor-field="cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField"]').should('not.exist');
        contentEditor.getField(SmallTextField, 'cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField');
    });

    it('should not enable automatically cemix:testAutoActivatedMixin on jnt:simpleText for create', () => {
        jcontent.createContent('jnt:text');
        cy.get('[data-sel-content-editor-field="cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField"]').should('not.exist');
        cy.get('[data-sel-content-editor-field="cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField"]').should('not.exist');
    });

    it('should not see readonly text field for reviewer', () => {
        const contentEditor = jcontent.createContent('jnt:text');
        const field = contentEditor.getField(SmallTextField, 'jnt:text_text');
        field.get().find('input').should('not.have.attr', 'readonly', 'readonly');

        cy.logout();
        cy.login('mathias', 'password');
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor2 = jcontent.createContent('jnt:text');
        const field2 = contentEditor2.getField(SmallTextField, 'jnt:text_text');
        field2.get().find('input').should('have.attr', 'readonly', 'readonly');
    });

    it('should not see description field for reviewer', () => {
        const contentEditor = jcontent.createContent('jnt:news');
        contentEditor.getField(SmallTextField, 'jnt:news_desc');

        cy.logout();
        cy.login('mathias', 'password');
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.createContent('jnt:news');
        cy.get('[data-sel-content-editor-field="jnt:news_desc"]').should('not.exist');
    });

    it('should render only one title field', () => {
        const contentTypeName = 'cent:epSifeRestaurant';

        cy.log('verify there is only one title field');
        jcontent.createContent(contentTypeName);
        // Get all the fields and ensure there is only one title field
        cy.get('[data-sel-content-editor-field]').should('have.length.greaterThan', 7).filter('[data-sel-content-editor-field$="_jcr:title"]').should('have.length', 1);
    });

    it('should display default resource key when module is disabled', () => {
        let contentEditor = jcontent.createContent('cent:defaultValueTest');
        let field = contentEditor.getField(SmallTextField, 'cent:defaultValueTest_defaultDate', false);
        field.get().find('label').should('contain', 'Default date label');
        contentEditor.create();

        cy.runProvisioningScript({
            script: {fileContent: '- stopBundle: "jcontent-test-module"', type: 'application/yaml'}
        });
        jcontent.getTable().getRowByName('default-value-test').contextMenu().select('Edit');
        contentEditor = new ContentEditor();
        field = contentEditor.getField(SmallTextField, 'cent:defaultValueTest_defaultDate', false);
        field.get().find('label').should('contain', 'defaultDate');
    });

    it('should not display advanced options tab for editor', () => {
        cy.logout();
        cy.login('mathias', 'password');
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const ceEditor = jcontent.editComponentByRowName('myText');

        ceEditor.switchToAdvancedMode();
        cy.get('.moonstone-header')
            .find('[data-sel-role="tab-advanced-options"]')
            .should('not.exist');
        ceEditor.cancel();
    });

    it('should display technical information in advanced options', () => {
        cy.logout();
        // Login as editor in chief
        cy.login('anne', 'password');
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const ceEditor = jcontent.editComponentByRowName('myText');
        ceEditor.switchToAdvancedMode();
        ceEditor.switchToAdvancedOptions();

        cy.get('[data-sel-labelled-info="Creation date"]').should('be.visible');
        cy.get('[data-sel-labelled-info="Last modification date"]').should('be.visible');
        cy.get('[data-sel-labelled-info="Last Publication Date"]').should('be.visible');
        cy.get('[data-sel-labelled-info="Creator"]').should('be.visible');
        cy.get('[data-sel-labelled-info="Last contributor"]').should('be.visible').should('contain', 'root');
        cy.get('[data-sel-labelled-info="Last Publisher"]').should('be.visible');

        cy.get('[data-sel-labelled-info="Main content type"]').should('contain', 'Simple text');
        cy.get('[data-sel-labelled-info="Full content type"]').should('contain', 'jnt:text');
        cy.get('[data-sel-labelled-info="Path"]').should('contain', '/sites/contentEditorSite/contents/myText');
        cy.get('[data-sel-labelled-info="UUID"]').should('be.visible');

        // Switch to edit tab and modify the text
        cy.get('.moonstone-header').find('[data-sel-role="tab-edit"]').click();
        ceEditor.getSmallTextField('jnt:text_text').addNewValue('My text updated');
        ceEditor.save();
        ceEditor.switchToAdvancedOptions();

        // Verify last contributor has changed
        cy.get('[data-sel-labelled-info="Last contributor"]').should('contain', 'anne');
    });

    it('should be able to check and uncheck boolean', () => {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFields_boolean"]')
            .find('input[type="checkbox"]')
            .check({force: true});
        contentEditor.save();
        cy.get('[data-sel-content-editor-field="qant:allFields_boolean"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'true');

        // Uncheck
        cy.get('[data-sel-content-editor-field="qant:allFields_boolean"]')
            .find('input[type="checkbox"]')
            .uncheck({force: true});
        contentEditor.save();
        cy.get('[data-sel-content-editor-field="qant:allFields_boolean"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'false');
        contentEditor.cancel();
    });

    it('check default values', () => {
        const contentEditor = jcontent.createContent('qant:AllFieldsDefault');
        contentEditor.create();
        jcontent.editComponentByRowName('all-fields-default-values');
        contentEditor.switchToAdvancedMode();

        cy.get('input[name="qant:AllFieldsDefault_sharedSmallText"]').should('have.value', 'value 1');
        cy.get('textarea[name="qant:AllFieldsDefault_sharedTextarea"]').should('have.value', 'value 1');
        contentEditor.getField(ChoiceListField, 'qant:AllFieldsDefault_sharedChoicelist').assertSelected('choice1');
        cy.get('input[name="qant:AllFieldsDefault_sharedLong"]').should('have.value', '1');
        cy.get('input[name="qant:AllFieldsDefault_sharedDouble"]').should('have.value', '1.1');
        cy.get('[data-sel-content-editor-field="qant:AllFieldsDefault_sharedBoolean"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'true');
        cy.frameLoaded('iframe.cke_wysiwyg_frame');
        cy.iframe('iframe.cke_wysiwyg_frame').should('contain', 'value 1');
        cy.get('input[id="qant:AllFieldsDefault_sharedDate"]').should('have.value', '06/04/2019 00:00');
        cy.get('input[name="qant:AllFieldsDefault_sharedDecimal"]').should('have.value', '1234567890.123457');
        cy.get('input[name="jmix:defaultPropMixin_mixinPropWithDefaultValue"]').should('have.value', 'value 1');
    });

    it('check default values - multiple', () => {
        const contentEditor = jcontent.createContent('qant:allFieldsMultipleDefault');
        contentEditor.create();
        jcontent.editComponentByRowName('all-multiple-fields-default-values');
        contentEditor.switchToAdvancedMode();

        contentEditor.getField(ChoiceListField, 'qant:allFieldsMultipleDefault_sharedChoicelist').assertSelected('choice1');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedSmallText[0]"]').should('have.value', 'test1=1');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedSmallText[1]"]').should('have.value', 'test2=2');
        cy.get('textarea[name="qant:allFieldsMultipleDefault_sharedTextarea[0]"]').should('have.value', 'value1');
        cy.get('textarea[name="qant:allFieldsMultipleDefault_sharedTextarea[1]"]').should('have.value', 'value2');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedLong[0]"]').should('have.value', '1');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedLong[1]"]').should('have.value', '2');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedDouble[0]"]').should('have.value', '1.1');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedDouble[1]"]').should('have.value', '2.2');
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultipleDefault_sharedBoolean[0]"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'true');
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultipleDefault_sharedBoolean[1]"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'false');
        cy.iframe('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultipleDefault_sharedBigtext[0]"] iframe.cke_wysiwyg_frame')
            .should('contain', 'value 1');
        cy.iframe('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultipleDefault_sharedBigtext[1]"] iframe.cke_wysiwyg_frame')
            .should('contain', 'value 2');
        cy.get('input[id="qant:allFieldsMultipleDefault_sharedDate[0]"]').should('have.value', '06/04/2019 00:00');
        cy.get('input[id="qant:allFieldsMultipleDefault_sharedDate[1]"]').should('have.value', '06/04/2029 00:00');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedDecimal[0]"]').should('have.value', '1234567890.123457');
        cy.get('input[name="qant:allFieldsMultipleDefault_sharedDecimal[1]"]').should('have.value', '1134567890.113457');
    });
});
