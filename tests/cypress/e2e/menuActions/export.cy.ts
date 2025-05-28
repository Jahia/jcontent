import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Export tests', () => {
    const siteKey = 'jContentSite-export';
    const downloadsFolder = Cypress.config('downloadsFolder');
    const labelWithSpecialCharacters =  "With spëc!al + characters"

    before(() => {
        createSite(siteKey);
        cy.apollo({
            mutationFile: 'jcontent/createTextContentUnderPath.graphql',
            variables: {path: `/sites/${siteKey}/contents`}
        });
        cy.apollo({
            mutationFile: 'jcontent/createTextContentUnderPath.graphql',
            variables: {contentName: labelWithSpecialCharacters, path: `/sites/${siteKey}/contents`}
        });
        cy.apollo({
            mutationFile: 'jcontent/createContentFolder.graphql',
            variables: {folderName: 'importFolder', parentPath: `/sites/${siteKey}/contents`}
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should export a content with sub-contents as zip', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');

        jcontent.exportComponentByText('landing', downloadsFolder, 'Staging content only', 'zip');

        // Reimport exported content
        jcontent.getTable().getRowByLabel('importFolder').get().dblclick();
        jcontent.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile(`${downloadsFolder}/landing.zip`, {force: true});
        jcontent.getTable().getRowByLabel('landing').get().dblclick();
        jcontent.getTable().getRowByLabel('test path 1').should('exist');
        jcontent.getTable().getRowByLabel('test path 2').should('exist');
        jcontent.getTable().getRowByLabel('test path 3').should('exist');
    });

    it('should export a content with special characters as zip', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');

        jcontent.exportComponentByText(labelWithSpecialCharacters, downloadsFolder, 'Staging content only', 'zip');

        // Reimport exported content
        jcontent.getTable().getRowByLabel('importFolder').get().dblclick();
        jcontent.getBrowseControlMenu().selectByRole('import');
        cy.get('#file-upload-input').selectFile(`${downloadsFolder}/${labelWithSpecialCharacters}.zip`, {force: true});
        jcontent.getTable().getRowByLabel(labelWithSpecialCharacters).get().dblclick();
        jcontent.getTable().getRowByLabel('test path 1').should('exist');
        jcontent.getTable().getRowByLabel('test path 2').should('exist');
        jcontent.getTable().getRowByLabel('test path 3').should('exist');
    });
});
