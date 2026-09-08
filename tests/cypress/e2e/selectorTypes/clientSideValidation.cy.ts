import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ContentEditor} from '../../page-object';

// Migrated from the Selenium test FieldsValidationTest.testClientSideValidation (Jahia/jcontent#2765).

describe('Content Editor - client-side field validation', () => {
    const siteKey = 'clientSideValidationSite';
    const contentName = 'allFields';
    const contentPath = `/sites/${siteKey}/contents/${contentName}`;

    const emailFieldName = 'qant:allFields_email';
    const dateFieldName = 'qant:allFields_date';

    const emailErrorCode = 'invalidPattern';
    const emailErrorMessage = 'Please provide a valid email';

    const invalidEmail = 'Adapted@text';
    const validEmail = 'Adapted@text.org';

    const invalidDate = '99/99/9999 99:99';
    const validDate = new Date(2019, 10, 25, 10, 5);

    // The edit form validates on mount and on blur, never on change so a value has to lose focus before its error is raised or cleared
    const blurField = (fieldName: string) =>
        cy.get(`[data-sel-content-editor-field="${fieldName}"]`).find('input[type="text"]').blur();

    const forced = true;

    const typeInvalidDate = () => {
        cy.get(`[data-sel-content-editor-field="${dateFieldName}"]`).find('input[type="text"]').as('dateInput');
        cy.get('@dateInput').clear({force: forced});
        cy.get('@dateInput').type(invalidDate, {force: forced});
    };

    before(() => {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: contentName,
            primaryNodeType: 'qant:allFields'
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('reports the email field own constraint message, and clears it once the address is valid', () => {
        const ce = ContentEditor.visit(contentPath, siteKey, 'en', 'content-folders/contents');

        ce.getSmallTextField(emailFieldName).addNewValue(invalidEmail);
        blurField(emailFieldName);
        ce.getSmallTextField(emailFieldName)
            .getErrorMessage(emailErrorCode)
            .should('be.visible')
            .and('contain', emailErrorMessage);

        ce.getSmallTextField(emailFieldName).addNewValue(validEmail);
        blurField(emailFieldName);
        ce.getSmallTextField(emailFieldName).getErrorMessage().should('not.exist');
    });

    it('keeps a validation error on the field that produced it', () => {
        const ce = ContentEditor.visit(contentPath, siteKey, 'en', 'content-folders/contents');

        ce.getSmallTextField(emailFieldName).addNewValue(invalidEmail);
        ce.getDateField(dateFieldName).addNewValue(validDate, forced);
        blurField(dateFieldName);
        ce.getSmallTextField(emailFieldName).getErrorMessage(emailErrorCode).should('be.visible');
        ce.getDateField(dateFieldName).getErrorMessage().should('not.exist');

        ce.getSmallTextField(emailFieldName).addNewValue(validEmail);
        typeInvalidDate();
        blurField(dateFieldName);
        ce.getDateField(dateFieldName).getErrorMessage('invalidDate').should('be.visible');
        ce.getSmallTextField(emailFieldName).getErrorMessage().should('not.exist');
    });
});
