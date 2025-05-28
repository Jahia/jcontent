import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Export tests', () => {
    const siteKey = 'jContentSite-export';
    const downloadsFolder = Cypress.config('downloadsFolder');

    before(() => {
        cy.login();
        createSite(siteKey);
        cy.apollo({
            mutationFile: 'jcontent/createContentFolder.graphql',
            variables: {folderName: 'importFolder', parentPath: `/sites/${siteKey}/contents`}
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should export a content with characters 1 as zip', () => {
        exportAndReimportAsZip('1');
    });

    it('should export a content with characters quote as zip', () => {
        exportAndReimportAsZip('\'');
    });

    it('should export a content with characters & as zip', () => {
        exportAndReimportAsZip('&');
    });

    it('should export a content with characters + as zip', () => {
        exportAndReimportAsZip('+');
    });

    it('should export a content with characters . as zip', () => {
        exportAndReimportAsZip('.');
    });

    it('should export a content with characters - as zip', () => {
        exportAndReimportAsZip('-');
    });

    it('should export a content with characters space as zip', () => {
        exportAndReimportAsZip(' ');
    });

    function exportAndReimportAsZip(character: string) {
        cy.login();
        const labelWithSpecialCharacters = 'Special' + character + 'characters';

        cy.apollo({
            mutationFile: 'jcontent/createTextContentUnderPath.graphql',
            variables: {contentName: labelWithSpecialCharacters, path: `/sites/${siteKey}/contents`}
        });

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
    }
});
