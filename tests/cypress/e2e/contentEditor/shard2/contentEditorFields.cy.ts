import {JContent} from '../../../page-object/jcontent';
import {
    addNode,
    enableModule
} from '@jahia/cypress';

describe('Content editor fields tests', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorFieldsSite';

    before(function () {
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: siteKey});
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'protectedFields',
            primaryNodeType: 'qant:protectedFields'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsSimple',
            primaryNodeType: 'qant:allFields'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsMultiple',
            primaryNodeType: 'qant:allFieldsMultiple'
        });
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should add and remove multiple values on small text field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_smallText"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_smallText[0]"]')
            .find('input')
            .type('testa=a');

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_smallText"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_smallText[1]"]')
            .find('input')
            .type('testb=b');
        contentEditor.save();

        cy.get('input[name="qant:allFieldsMultiple_smallText[0]"]').should('have.value', 'testa=a');
        cy.get('input[name="qant:allFieldsMultiple_smallText[1]"]').should('have.value', 'testb=b');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_smallText[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();
        cy.get('input[name="qant:allFieldsMultiple_smallText[0]"]').should('have.value', 'testb=b');

        cy.get('input[name="qant:allFieldsMultiple_smallText[0]"]').clear({force: true});
        cy.get('input[name="qant:allFieldsMultiple_smallText[0]"]').type('testb=c', {force: true});
        contentEditor.save();
        cy.get('input[name="qant:allFieldsMultiple_smallText[0]"]').should('have.value', 'testb=c');
    });

    it('should add and remove multiple values on text area field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_textarea"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_textarea[0]"]')
            .find('textarea')
            .type('valueA');

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_textarea"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_textarea[1]"]')
            .find('textarea')
            .type('valueB');
        contentEditor.save();

        cy.get('textarea[name="qant:allFieldsMultiple_textarea[0]"]').should('have.value', 'valueA');
        cy.get('textarea[name="qant:allFieldsMultiple_textarea[1]"]').should('have.value', 'valueB');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_textarea[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();
        cy.get('textarea[name="qant:allFieldsMultiple_textarea[0]"]').should('have.value', 'valueB');
    });

    it('should add and remove multiple values on long field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_long"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_long[0]"]')
            .find('input')
            .type('123456789');

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_long"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_long[1]"]')
            .find('input')
            .type('987654321');
        contentEditor.save();

        cy.get('input[name="qant:allFieldsMultiple_long[0]"]').should('have.value', '123456789');
        cy.get('input[name="qant:allFieldsMultiple_long[1]"]').should('have.value', '987654321');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_long[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();
        cy.get('input[name="qant:allFieldsMultiple_long[0]"]').should('have.value', '987654321');
    });

    it('should add and remove multiple values on double field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_double"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_double[0]"]')
            .find('input')
            .type('1.1');

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_double"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_double[1]"]')
            .find('input')
            .type('2.2');
        contentEditor.save();

        cy.get('input[name="qant:allFieldsMultiple_double[0]"]').should('have.value', '1.1');
        cy.get('input[name="qant:allFieldsMultiple_double[1]"]').should('have.value', '2.2');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_double[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();
        cy.get('input[name="qant:allFieldsMultiple_double[0]"]').should('have.value', '2.2');
    });

    it('should add and remove multiple boolean', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_boolean"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[0]"]')
            .find('input[type="checkbox"]')
            .check({force: true});

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_boolean"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[1]"]')
            .find('input[type="checkbox"]');
        contentEditor.save();

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[0]"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'true');
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[1]"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'false');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_boolean[0]"]')
            .find('input[type="checkbox"]')
            .should('have.attr', 'aria-checked', 'false');
    });

    it('should add and remove multiple values on date field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_date"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_date[0]"]')
            .find('input[type="text"]')
            .type('02/09/2024 10:30');

        cy.get('[data-sel-content-editor-field="qant:allFieldsMultiple_date"]')
            .find('[data-sel-action="addField"]')
            .click();
        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_date[1]"]')
            .find('input[type="text"]')
            .type('05/06/2025 20:30');

        cy.get('input[id="qant:allFieldsMultiple_date[0]"]').should('have.value', '02/09/2024 10:30');
        cy.get('input[id="qant:allFieldsMultiple_date[1]"]').should('have.value', '05/06/2025 20:30');

        cy.get('[data-sel-content-editor-multiple-generic-field="qant:allFieldsMultiple_date[0]"]')
            .find('[data-sel-action="removeField_0"]')
            .click();
        cy.get('input[id="qant:allFieldsMultiple_date[0]"]').should('have.value', '05/06/2025 20:30');
    });

    it('should save valid values in number fields', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        const longFieldSelector = '[data-sel-content-editor-field="qant:allFields_long"] input';
        const doubleFieldSelector = '[data-sel-content-editor-field="qant:allFields_double"] input';

        contentEditor.switchToAdvancedMode();

        cy.get(longFieldSelector).scrollIntoView();
        cy.get(longFieldSelector).should('exist');
        cy.get(longFieldSelector).clear({force: true});
        cy.get(longFieldSelector).type('1234', {force: true});

        cy.get(doubleFieldSelector).scrollIntoView();
        cy.get(doubleFieldSelector).should('exist');
        cy.get(doubleFieldSelector).clear({force: true});
        cy.get(doubleFieldSelector).type('201.75', {force: true});

        contentEditor.save();

        cy.get('input[name="qant:allFields_long"]').should('have.value', '1234');
        cy.get('input[name="qant:allFields_double"]').should('have.value', '201.75');
    });

    it('should reject invalid characters in double field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        const doubleFieldSelector = '[data-sel-content-editor-field="qant:allFields_double"] input';

        contentEditor.switchToAdvancedMode();

        cy.get(doubleFieldSelector).scrollIntoView();
        cy.get(doubleFieldSelector).should('exist');
        cy.get(doubleFieldSelector).clear({force: true});
        cy.get(doubleFieldSelector).type('20192.75abcd', {force: true});

        cy.get('input[name="qant:allFields_double"]').should('have.value', '20192.75');
        contentEditor.cancelAndDiscard();
    });

    it('should add values to text area', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        contentEditor.switchToAdvancedMode();

        cy.get('[data-sel-content-editor-field="qant:allFields_textarea"]')
            .find('textarea')
            .type('This is my text');
        contentEditor.save();
        cy.get('textarea[name="qant:allFields_textarea"]').should('have.value', 'This is my text');

        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('fr');
        cy.get('textarea[name="qant:allFields_textarea"]').should('have.value', '');
        cy.get('[data-sel-content-editor-field="qant:allFields_textarea"]')
            .find('textarea')
            .type('Voici mon texte');
        cy.get('textarea[name="qant:allFields_textarea"]').should('have.value', 'Voici mon texte');
        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('en');
        cy.get('textarea[name="qant:allFields_textarea"]').should('have.value', 'This is my text');
    });

    it('check read only fields on protectedFields', () => {
        const contentEditor = jcontent.editComponentByRowName('protectedFields');
        contentEditor.switchToAdvancedMode();

        const protectedFields = [
            'qant:protectedFields_protectedText',
            'qant:protectedFields_protectedTextarea',
            'qant:protectedFields_protectedLong',
            'qant:protectedFields_protectedBoolean',
            'qant:protectedFields_protectedDate',
            'qant:protectedFields_protectedChoicelist',
            'qant:protectedFields_protectedDynamicChoicelist'
        ];

        protectedFields.forEach(fieldName => {
            cy.get(`[data-sel-content-editor-field="${fieldName}"]`).scrollIntoView();
            cy.get(`[data-sel-content-editor-field="${fieldName}"]`)
                .should('have.attr', 'data-sel-content-editor-field-readonly', 'true');
        });
        contentEditor.cancel();
    });
});
