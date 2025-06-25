import {TagField} from '../../page-object/fields/tagField';
import {JContent} from '../../page-object/jcontent';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Content Editor - Selector Types', () => {
    const siteKey = 'selectorTypeTestSite';
    const nodeName = 'selectorTypeTestNode';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: nodeName,
            primaryNodeType: 'cent:selectorTypeTest'
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.login();
    });

    it('should display error when tag selector is not marked multiple', () => {
        const ce = JContent.visit(siteKey, 'en', `content-folders/contents/${nodeName}`).editContent();
        ce.getField(TagField, 'cent:selectorTypeTest_errorTag')
            .should('be.visible')
            .find('[data-sel-error="tag-multiple-error"]')
            .should('be.visible');
    });
});
