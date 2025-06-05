
import {createSite, deleteSite, getComponent} from '@jahia/cypress';
import {ExportDialog} from '../../page-object/exportDialog';
import {JContent} from '../../page-object';

describe('Export tests', () => {
    const siteKey = 'jContentSite-export';
    const downloadsFolder = Cypress.config('downloadsFolder');

    function exportAndReimportAsZip(character: string) {
        cy.login();
        const labelWithSpecialCharacters = 'Special' + character + 'characters';

        cy.apollo({
            mutationFile: 'jcontent/createTextContentUnderPath.graphql',
            variables: {contentName: labelWithSpecialCharacters, path: `/sites/${siteKey}/contents`}
        });

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/content');

        jcontent.getTable().getRowByLabel(labelWithSpecialCharacters).contextMenu().select('Export');
        const exportDialog = getComponent(ExportDialog);
        exportDialog.export(downloadsFolder);
        cy.waitUntil(() => cy.exec(`ls ${downloadsFolder}`).then(result => {
            console.log(result.stdout);
            return result.stdout.includes(`${labelWithSpecialCharacters}.zip`);
        }), {timeout: 30000, interval: 1000, errorMsg: 'Unable to download content as zip'});

        // Reimport exported content
        jcontent.getTable().getRowByLabel('importFolder').get().dblclick();
        jcontent.import(`${downloadsFolder}/${labelWithSpecialCharacters}.zip`);

        jcontent.getTable().getRowByLabel(labelWithSpecialCharacters).get().dblclick();
        jcontent.getTable().getRowByLabel('test path 1').should('exist');
        jcontent.getTable().getRowByLabel('test path 2').should('exist');
        jcontent.getTable().getRowByLabel('test path 3').should('exist');
    }

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
});
