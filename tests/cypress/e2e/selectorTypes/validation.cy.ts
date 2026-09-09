import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {SmallTextField} from '../../page-object/fields';

describe('Test the text field initializer', {testIsolation: false}, () => {
    const siteKey = 'validation';
    let jcontent : JContent;

    before(function () {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        cy.login();
        jcontent = JContent
            .visit(siteKey, 'en', 'content-folders/contents')
            .switchToListMode();
    });

    after(function () {
        deleteSite(siteKey);
    });

    it('should handle constraint on create/normal prop', () => {
        const ce = jcontent.createContent('cent:textFieldInitializer');
        ce.getField(SmallTextField, 'nt:base_ce:systemName', false).addNewValue('test-validator-shared');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultString', false).clearValue();
        ce.createUnchecked();
        cy.contains('There is one validation error');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultString', false).addNewValue('1234');
        ce.create();
    });

    it('should handle constraint on edit/normal prop', () => {
        const ce = jcontent.editComponentByText('test-validator-shared');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultString', false).clearValue();
        ce.saveUnchecked();
        cy.contains('There is one validation error');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultString', false).addNewValue('12345');
        ce.save();
    });

    it('should handle constraint on create/i18n prop', () => {
        const ce = jcontent.createContent('cent:textFieldInitializer');
        ce.getField(SmallTextField, 'nt:base_ce:systemName', false).addNewValue('test-validator-i18n');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultI18nString', false).addNewValue('1');
        ce.createUnchecked();
        cy.contains('There is one validation error');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultI18nString', false).addNewValue('1234');
        ce.create();
    });

    it('should handle constraint on edit/i18n prop', () => {
        const ce = jcontent.editComponentByText('test-validator-i18n');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultI18nString', false).addNewValue('12');
        ce.saveUnchecked();
        cy.contains('There is one validation error');
        ce.getField(SmallTextField, 'cent:textFieldInitializer_defaultI18nString', false).addNewValue('12345');
        ce.save();
    });

    // Regression test for jcontent#2374: a custom validator constraint on a property with no
    // default value (so the field is absent from the create form's initial values) must still
    // surface its message on the field, including a custom validator message.
    it('should display the custom validator message on a field with no default value', {retries: 3}, () => {
        // Re-visit to get a clean page state so retries can recover from transient query errors
        jcontent = JContent
            .visit(siteKey, 'en', 'content-folders/contents')
            .switchToListMode();
        const ce = jcontent.createContent('cent:noDefaultValidator');
        ce.getField(SmallTextField, 'nt:base_ce:systemName', false).addNewValue('test-validator-nodefault');
        ce.createUnchecked();
        // The message is interpolated into the constraintViolation translation, which used to
        // escape it -- so its apostrophe and ampersand reached the reader as entities
        // (jcontent#2748). Asserting the punctuation, not just the plain words.
        ce.getField(SmallTextField, 'cent:noDefaultValidator_noDefaultString', false)
            .getErrorMessage()
            .should('contain', 'noDefaultString must not be empty & mustn\'t use "quotes" or /')
            .and('not.contain', '&#')
            .and('not.contain', '&amp;');
        ce.getField(SmallTextField, 'cent:noDefaultValidator_noDefaultString', false).addNewValue('a value');
        ce.create();
    });
});

