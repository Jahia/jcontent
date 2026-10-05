import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../../page-object';

describe('Field description', () => {
    const siteKey = 'fieldDescriptionSite';
    // The caption line height the folded description is clamped to
    const lineHeight = 16;

    const getDescription = (fieldName: string) =>
        cy.get(`[data-sel-content-editor-field="cent:fieldDescriptionTest_${fieldName}"] [data-sel-role="field-description"]`);

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.login();
        JContent.visit(siteKey, 'en', 'content-folders/contents').createContent('cent:fieldDescriptionTest');
    });

    it('should show a short description in full, without a button', () => {
        getDescription('shortDescription').should('contain', 'A short description');
        getDescription('shortDescription').find('[data-sel-role="field-description-toggle"]').should('not.exist');
    });

    it('should fold a long description to one line, and expand it then fold it back', () => {
        getDescription('longDescription').scrollIntoView();
        getDescription('longDescription').find('p').invoke('outerHeight').should('equal', lineHeight);
        getDescription('longDescription').find('a').should('have.attr', 'href', 'https://www.jahia.com');

        getDescription('longDescription').find('[data-sel-role="field-description-toggle"]')
            .should('have.attr', 'aria-expanded', 'false')
            .and('have.text', '…')
            .click();
        getDescription('longDescription').find('p').invoke('outerHeight').should('be.greaterThan', lineHeight);
        getDescription('longDescription').find('a').should('be.visible');

        getDescription('longDescription').find('[data-sel-role="field-description-toggle"]')
            .should('have.attr', 'aria-expanded', 'true')
            .and('have.text', 'Show less')
            .click();
        getDescription('longDescription').find('p').invoke('outerHeight').should('equal', lineHeight);
        getDescription('longDescription').find('[data-sel-role="field-description-toggle"]').should('have.attr', 'aria-expanded', 'false');
    });
});
