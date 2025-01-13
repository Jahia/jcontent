import {createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../../page-object';

describe('default override tests', () => {
    const siteKey = 'defaultOverrideTests';

    before(function () {
        createSite(siteKey);
    });

    after(function () {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('should not have SEO section for non-displayable types', function () {
        JContent.visit(siteKey, 'en', 'content-folders/contents').createContent('jnt:bigText');
        cy.get('[data-sel-content-editor-fields-group="seo"]').should('not.exist', {timeout: 10000});
    });
});
