import {JContent, ContentEditor} from '../../../page-object';
import {ChoiceListField, SmallTextField} from '../../../page-object/fields';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

// This test makes use of jmix_freezeSystemName.json form override from jcontent-test-module
describe('Extend Mixins tests with CE', () => {
    const siteKey = 'extendMixinsSite';
    const systemNameFieldSel = 'nt:base_ce:systemName';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Applies extend mixin only if it is enabled on the node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        let contentEditor = jcontent.editPage();

        cy.log('Verify conditional override is not applied');
        let systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isNotReadOnly();

        cy.log('Enable the mixin');
        contentEditor.toggleOption('jmix:freezeSystemName');
        contentEditor.save();

        cy.log('Verify conditional override is applied after applying mixin');
        contentEditor = jcontent.editPage();
        systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isReadOnly();

        contentEditor.cancel();
    });

    it('Does not apply extend mixin on create', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('New Page');
        let contentEditor = new ContentEditor();

        cy.log('Verify conditional override is not applied on create');
        let systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isNotReadOnly();

        cy.log('Enable the mixin');
        contentEditor.toggleOption('jmix:freezeSystemName');
        contentEditor.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue('Test page');
        contentEditor.getField(ChoiceListField, 'jmix:hasTemplateNode_j:templateName').addNewValue('2-column');
        contentEditor.create();

        cy.log('Verify conditional override is applied to created page after applying mixin');
        jcontent.getAccordionItem('pages').getTreeItem('test-page').contextMenu().select('Edit');
        contentEditor = new ContentEditor();
        systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isReadOnly();

        contentEditor.cancel();
    });

    it('Allows overriding prop UI metadata on inherited nodes', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');

        let contentEditor = jcontent.createContent('cent:testPropOverridesA');
        let field = contentEditor.getSmallTextField('jmix:testPropOverrides_testprop');
        field.get()
            .should('contain.text', 'Test Prop Overrides A')
            .should('contain.text', 'Test Tooltip for Prop Overrides A');
        contentEditor.cancel();

        contentEditor = jcontent.createContent('cent:testPropOverridesB');
        field = contentEditor.getSmallTextField('jmix:testPropOverrides_testprop');
        field.get()
            .should('contain.text', 'Test Prop Overrides B')
            .should('contain.text', 'Test Tooltip for Prop Overrides B');
    });
});
