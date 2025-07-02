import {JContent} from '../../page-object/jcontent';
import {Field, SmallTextField} from '../../page-object/fields';
import {Button, Dropdown, getComponentByRole, getComponentBySelector} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor} from '../../page-object';

describe('Content editor form', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorSite';

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({
            mutation: gql`mutation GrantRoles {
                jcr {
                    grantRoles: mutateNode(pathOrId: "/sites/contentEditorSite") {
                        grantRoles(roleNames: "editor", principalType: USER, principalName: "mathias")
                    }
                    addContent: mutateNode(pathOrId: "/sites/contentEditorSite/contents") {
                        addChild(
                            name: "alwaysActivatedOverrideTest", 
                            primaryNodeType: "jnt:bigText", 
                            properties: [{ name: "text", language: "en", value: "isAlwaysActivated override test" }]
                        ) {
                            uuid
                        }
                    }
                }
            }`
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

    it('Should display custom title label and error message', function () {
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

    it('Should display overridden title label for boolean buttons', function () {
        const contentEditor = jcontent.createContent('cent:mesiHeaderBanner');
        const field = contentEditor.getField(Field, 'cemix:mesiBannerStory_buttonTransverse', false);
        field.get().find('label').should('contain', 'Contribuer le bouton transverse Header ?');
    });

    it('Should display overridden property in correct section', function () {
        jcontent.createContent('cent:myComponent');
        cy.get('article').contains('myComponent').parents('article').find('div[data-sel-content-editor-field]').should('have.length', 2);
        cy.get('article').contains('categorizedContent').parents('article').find('div[data-sel-content-editor-field]').should('have.length', 2).as('categorizedContentFields');
        cy.get('@categorizedContentFields').first().should('contain.text', 'category');
        cy.get('@categorizedContentFields').last().should('contain.text', 'subcategory');
    });

    it('Should update dependent property "j:subNodesView" in content retrieval when changing "j:type"', () => {
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

    it('Should use site default template value', () => {
        const contentTypeName = 'cent:testDefaultTemplate';
        const templateName = 'events';
        const fieldName = 'cent:testDefaultTemplate_j:templateName';

        cy.log('Set default template value for site');
        setDefaultSiteTemplate(templateName);

        cy.log('verify default template is shown in new component');
        const contentEditor = jcontent.createContent(contentTypeName);
        const field = contentEditor.getField(Field, fieldName);
        field.get().find('[role="dropdown"]')
            .should('contain', templateName)
            .and('have.class', 'moonstone-disabled'); // Read-only
        contentEditor.create(); // No errors on create
    });

    it('Should display hidden property with overridden hide flag', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_j:invalidLanguagesHiddenTest', true);
        field.addNewValue('fr', true);
        field.addNewValue('de', true);
        contentEditor.create();
        jcontent.editComponentByText('contentRetrievalCETest');
        const fieldEdit = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_j:invalidLanguagesHiddenTest', true);
        fieldEdit.checkValues(['fr', 'de']);
    });

    it('Should display overridden title label and description label from json overrides define by labelKey and descriptionKey', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'cent:contentRetrievalCETest_jcr:title', false);
        field.get().find('label').should('contain', 'Title JSON override');
        field.get().scrollIntoView().contains('Information').should('be.visible');
    });

    it('Should display overridden system name and description labels from json overrides', () => {
        const contentEditor = jcontent.createContent('cent:contentRetrievalCETest');
        const field = contentEditor.getField(SmallTextField, 'nt:base_ce:systemName', false);
        field.get().find('label').should('contain', 'Customized system name');
        field.get().scrollIntoView().contains('Customized description').should('be.visible');
    });

    it('Should enable automatically cemix:testAutoActivatedMixin on jnt:bigText for create', () => {
        const contentEditor = jcontent.createContent('jnt:bigText');
        contentEditor.getField(SmallTextField, 'cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField');
        contentEditor.getField(SmallTextField, 'cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField');
    });

    it('Should enable automatically cemix:testAutoAlwaysActivatedMixin on jnt:bigText for edit', () => {
        const contentEditor = jcontent.editComponentByText('isAlwaysActivated override test');
        cy.get('[data-sel-content-editor-field="cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField"]').should('not.exist');
        contentEditor.getField(SmallTextField, 'cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField');
    });

    it('Should not enable automatically cemix:testAutoActivatedMixin on jnt:simpleText for create', () => {
        jcontent.createContent('jnt:text');
        cy.get('[data-sel-content-editor-field="cemix:testAutoActivatedMixin_j:testAutoActivatedMixinField"]').should('not.exist');
        cy.get('[data-sel-content-editor-field="cemix:testAutoAlwaysActivatedMixin_j:testAutoAlwaysActivatedMixinField"]').should('not.exist');
    });

    it('Should not see readonly text field for reviewer', () => {
        const contentEditor = jcontent.createContent('jnt:text');
        const field = contentEditor.getField(SmallTextField, 'jnt:text_text');
        field.get().find('input').should('not.have.attr', 'readonly', 'readonly');
        cy.login('mathias', 'password');

        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor2 = jcontent.createContent('jnt:text');
        const field2 = contentEditor2.getField(SmallTextField, 'jnt:text_text');
        field2.get().find('input').should('have.attr', 'readonly', 'readonly');
    });

    it('Should not see see field for reviewer', () => {
        const contentEditor = jcontent.createContent('jnt:news');
        contentEditor.getField(SmallTextField, 'jnt:news_desc');
        cy.login('mathias', 'password');

        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.createContent('jnt:news');
        cy.get('[data-sel-content-editor-field="jnt:news_desc"]').should('not.exist');
    });

    it('Should render only one title field', () => {
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
        jcontent.getTable().getRowByLabel('default-value-test').contextMenu().select('Edit');
        contentEditor = new ContentEditor();
        field = contentEditor.getField(SmallTextField, 'cent:defaultValueTest_defaultDate', false);
        field.get().find('label').should('contain', 'defaultDate');
    });
});
