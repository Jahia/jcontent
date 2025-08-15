import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {NumberField} from '../../page-object/fields';

describe('Numbers validation tests', {testIsolation: false}, () => {
    const siteKey = 'validation';
    let jcontent : JContent;

    before(function () {
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

    it('gives appropriate feedback for incorrect number types', () => {
        const ce = jcontent.createContent('cent:numbers');
        // Required field checked
        ce.createUnchecked();
        cy.contains('There is one validation error').find('a').contains('longReq');
        ce.discardErrorDialog();

        // Incorrect long does not pass validation
        ce.getField(NumberField, 'cent:numbers_longReq', false).addNewValue('234');
        ce.getField(NumberField, 'cent:numbers_long', false).addNewValue('2.3');
        ce.createUnchecked();
        cy.contains('There is one validation error').find('a').contains('long');
        ce.discardErrorDialog();

        ce.getField(NumberField, 'cent:numbers_long', false).addNewValue('23');
        // Note that cypress does not allow to type something like 32.-+323, which would be useful here to test empty value
        ce.getField(NumberField, 'cent:numbers_longReq', false).addNewValue('32.34');
        ce.createUnchecked();
        cy.contains('There is one validation error').find('a').contains('longReq');
        ce.discardErrorDialog();

        // Content is saved
        ce.getField(NumberField, 'cent:numbers_longReq', false).addNewValue('234');
        ce.getField(NumberField, 'cent:numbers_long', false).addNewValue('23');
        ce.getField(NumberField, 'cent:numbers_double', false).addNewValue('32');
        ce.createUnchecked();

        cy.contains('There is one validation error').should('not.exist');
    });
});

