import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';

describe('Usages badge in content editor', () => {
    const siteKey = 'usagesBadgeSite';

    before(() => {
        createSite(siteKey);
        addNode({
            name: 'test-simple-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'Simple text content'}],
            parentPathOrId: `/sites/${siteKey}/contents`
        });
        addNode({
            name: 'test-simple-reference',
            primaryNodeType: 'jnt:contentReference',
            properties: [
                {name: 'j:node', language: 'en', type: 'REFERENCE', value: '/sites/usagesBadgeSite/contents/test-simple-text'}
            ],
            parentPathOrId: `/sites/${siteKey}/contents`
        });
        cy.apollo({mutationFile: 'contentEditor/usagesBadge/createTestNodes.graphql'});
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('displays 1 usage badge when content has one reference', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('test-simple-text').contextMenu().select('Edit');
        cy.get('.moonstone-chip').contains('1 usage').should('be.visible');
    });

    it('does not display usages badge when content has no', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('test-simple-reference').contextMenu().select('Edit');
        cy.get('.moonstone-chip').contains('usage').should('not.exist');
    });
});
