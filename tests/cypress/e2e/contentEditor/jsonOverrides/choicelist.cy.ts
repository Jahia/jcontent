import {JContent} from '../../../page-object';
import {createSite, deleteSite, Dropdown, enableModule, getComponentBySelector} from '@jahia/cypress';
import {RadioChoiceList, CheckboxChoiceList} from '../../../page-object/fields/toggleChoiceList';
import {Field} from '../../../page-object/fields';

// Override defined in jcontent-test-module, forms/cent_choiceListSelectorTypeOverride.json
describe('radio button and checkbox selectorType overrides', {defaultCommandTimeout: 10000}, () => {
    let jcontent: JContent;

    const siteKey = 'contentEditorSite';
    const moduleName = 'jcontent-test-module';

    before(() => {
        createSite(siteKey);
        enableModule(moduleName, siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should select from basic static choicelist with no default value', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('cent:choiceListSelectorTypeOverride');
        const field: Dropdown = getComponentBySelector(Dropdown, '[data-sel-content-editor-field="cent:choiceListSelectorTypeOverride_noDefaultList"]');
        field.select('choice1');
        field.get().click();
        field.get().find('.moonstone-menuItem').should('have.length', 2);
    });

    it('should override choice list with radio button selectorType', {defaultCommandTimeout: 10000}, () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        let contentEditor = jcontent.createContent('cent:choiceListSelectorTypeOverride');
        let field: RadioChoiceList = contentEditor.getField(
            RadioChoiceList, 'cent:choiceListSelectorTypeOverride_radioButton', false);

        field.assertSelected('choice1');
        field.assertExists('choice2');
        field.assertExists('choice3');
        field.select('choice2');
        contentEditor.create();

        cy.log('Verify only choice 2 is selected');
        contentEditor = jcontent.editComponentByText('choiceListSelectorTypeOverride');
        field = contentEditor.getField(RadioChoiceList, 'cent:choiceListSelectorTypeOverride_radioButton', false);
        field.assertSelected('choice2');
        field.assertNotSelected('choice1');
    });

    it('should override multiple choice list with checkbox selectorType', {defaultCommandTimeout: 10000}, () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        let contentEditor = jcontent.editComponentByText('choiceListSelectorTypeOverride');
        let field: CheckboxChoiceList = contentEditor.getField(
            CheckboxChoiceList, 'cent:choiceListSelectorTypeOverride_checkbox', false);

        field.assertSelected('choice7');
        field.assertExists('choice8');
        field.assertExists('choice9');
        field.select('choice9');
        contentEditor.save();

        cy.log('Verify both choice 7 and 9 is selected');
        contentEditor = jcontent.editComponentByText('choiceListSelectorTypeOverride');
        field = contentEditor.getField(CheckboxChoiceList, 'cent:choiceListSelectorTypeOverride_checkbox', false);
        field.assertSelected('choice7');
        field.assertNotSelected('choice8');
        field.assertSelected('choice9');

        cy.log('Verify context menu');
        field.contextMenu().select('Clear');
        field.assertNotSelected('choice7');
        field.assertNotSelected('choice8');
        field.assertNotSelected('choice9');

        field.contextMenu().select('Select all');
        field.assertSelected('choice7');
        field.assertSelected('choice8');
        field.assertSelected('choice9');
    });

    it('should not override choice list with no selectorType defined', () => {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('cent:choiceListSelectorTypeOverride');
        const field = contentEditor.getField(Field, 'cent:choiceListSelectorTypeOverride_list', false);
        // Verify field still contains standard dropdown selector
        field.get().scrollIntoView()
            .find('.moonstone-dropdown')
            .should('exist');
    });

    it('should not override multiple choice list with no selectorType defined', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByText('choiceListSelectorTypeOverride');
        const field: Field = contentEditor.getField(
            Field, 'cent:choiceListSelectorTypeOverride_mList', false);
        // Verify field still contains standard dropdown selector
        field.get().scrollIntoView()
            .find('.moonstone-dropdown')
            .should('exist');
    });
});
