import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {Field} from '../../page-object/fields';

describe('TextArea field', () => {
    const siteKey = 'textAreaSite';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    // Definition of cent:textArea: area1 (string, textarea[height='220'])
    it('should apply the height selector option to the textarea', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('cent:textArea');
        const field = contentEditor.getField(Field, 'cent:textArea_area1', false);

        // The definition value (220) must reach the rendered textarea
        field.get().find('textarea').should('have.css', 'max-height', '220px');
    });
});
