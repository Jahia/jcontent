// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650), FT-031 to FT-032.
//
// Regression QA-12527: content that came in through an import offered no Delete. contents_QA-12527.zip
// is the archive of the legacy test: a `contents` content folder holding one rich text, in en.

import {context, createSite, jfaker} from '@jahia/cypress';
import {JContent} from '../../page-object';
import gql from 'graphql-tag';

const siteKey = 'deleteImportedContentSite';
const folderName = `importzip-${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;
const importedFolder = 'contents';
const importedContent = 'superfantastisch';

// Guarded by the existence of the site, so this also pre-cleans what a previous run left behind.
const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
};

describe('Delete content that came in through an import', {testIsolation: false}, () => {
    let jcontent: JContent;

    before(() => {
        removeFixtures();
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.apollo({
            mutationFile: 'jcontent/createContentFolder.graphql',
            variables: {folderName, parentPath: `/sites/${siteKey}/contents`}
        });

        cy.login();
        jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
        jcontent.import('cypress/fixtures/jcontent/menuActions/contents_QA-12527.zip');
        cy.get('[data-cm-role="upload-status-success"]', {timeout: 30000}).should('be.visible');
        cy.get('[data-cm-role="upload-close-button"]').click();
    });

    after(() => {
        removeFixtures();
        cy.logout();
    });

    it('Imported content in a new folder offers Delete', () => {
        context.tag('jcontent', 'import-delete', 'delete-menu');
        jcontent.getTable().getRowByName(importedFolder).dblclick();
        const contentRow = jcontent.getTable().getRowByName(importedContent);
        contentRow.get().should('contain', 'Ich heiße Superfantastisch!');
        const contentMenu = contentRow.contextMenu();
        contentMenu.shouldHaveRoleItem('delete');
        contentMenu.close();

        jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
        const folderMenu = jcontent.getTable().getRowByName(importedFolder).contextMenu();
        folderMenu.shouldHaveRoleItem('delete');
        folderMenu.close();
    });

    describe('once the imported folder is offered for deletion', () => {
        it('An imported folder can be deleted permanently', () => {
            context.tag('jcontent', 'import-delete', 'delete-permanently');
            jcontent.getTable().getRowByName(importedFolder).markForDeletion().deletePermanently();

            cy.get(`[data-cm-role="table-content-list-row"][data-node-name="${importedFolder}"]`).should('not.exist');
            cy.apollo({
                query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/contents/${folderName}") { children { nodes { name } } } } }`,
                fetchPolicy: 'no-cache'
            }).should(resp => {
                // The parent must resolve, or an empty child list would prove nothing.
                expect(resp.data.jcr.nodeByPath, 'the folder the zip was imported into').to.not.be.null;
                expect(resp.data.jcr.nodeByPath.children.nodes.map(n => n.name)).to.not.include(importedFolder);
            });
        });
    });
});
