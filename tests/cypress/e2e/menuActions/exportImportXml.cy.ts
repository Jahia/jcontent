import {addNode, context, createSite, createUser, deleteUser, getComponent, grantRoles, jfaker} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {ExportDialog} from '../../page-object/exportDialog';

const siteKey = 'exportImportXmlSite';
const editor = {username: 'exportImportXmlEditor', password: 'password'};
const suffix = jfaker.string.alphanumeric({length: 8, casing: 'lower'});
const contentName = `xml-export-${suffix}`;
const contentText = `XML export ${suffix}`;

// Both scripts are guarded, so this also pre-cleans what a previous run left behind.
const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

describe('Export as XML and import of an unsupported file', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');

    before(() => {
        removeFixtures();
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editor.username, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: contentName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: contentText, language: 'en'}]
        });
    });

    after(() => {
        removeFixtures();
        cy.logout();
    });

    it('Export of a content as XML', () => {
        context.tag('jcontent', 'import-export', 'export-xml');
        cy.login(editor.username, editor.password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.getTable().getRowByName(contentName).contextMenu().selectByRole('export');
        getComponent(ExportDialog).export(downloadsFolder, 'Staging content only', 'xml');

        // The file is the XML document view of the node, named after it.
        cy.readFile(`${downloadsFolder}/${contentName}.xml`, {timeout: 30000})
            .should('contain', `<${contentName} `)
            .and('contain', 'jcr:primaryType="jnt:text"')
            .and('contain', contentText);
    });

    it('Import of an unsupported file is refused', () => {
        context.tag('jcontent', 'import-export', 'import-invalid');
        cy.login(editor.username, editor.password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.import('cypress/fixtures/assets/uploadMedia/myfile.png');

        cy.get('[data-cm-role="upload-status-error"]', {timeout: 30000}).should('be.visible');
        // The server rejects the archive, and the upload item maps that error to the wrong-input message.
        cy.get('[data-sel-role="upload-error-msg"]').should('contain', 'Invalid file format');
        cy.get('[data-cm-role="upload-status-success"]').should('not.exist');
    });
});
