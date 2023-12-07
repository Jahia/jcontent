import {JContent} from '../../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('overrideTests', {testIsolation: false}, () => {
    const siteKey = 'contentEditorSite';
    const moduleName = 'jcontent-test-module';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'contentEditor/overrideTests/references.graphql'});
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
    });

    it('can hide advancedMode button with json override', () => {
        enableModule(moduleName, siteKey);
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.editComponentByText('test-content1');
        cy.get('button[data-sel-role="advancedMode"]').should('not.exist');
    });

    it('can restore advanced mode button when module is undeployed', () => {
        cy.apollo({
            mutationFile: 'contentEditor/overrideTests/undeployModule.graphql',
            variables: {moduleName, pathOrId: `/sites/${siteKey}`}
        });
        const jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.editComponentByText('test-content1');
        cy.get('button[data-sel-role="advancedMode"]').should('exist');
    });
});

