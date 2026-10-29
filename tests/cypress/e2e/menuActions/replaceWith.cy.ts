// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650).

import {
    addNode,
    context,
    createSite,
    createUser,
    deleteUser,
    grantRoles,
    jfaker,
    publishAndWaitJobEnding,
    uploadFile
} from '@jahia/cypress';
import {JContent} from '../../page-object';

const siteKey = 'replaceWithSite';
const editor = {username: 'replaceWithEditor', password: 'password'};
const folderName = `replace-${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;
const folderPath = `/sites/${siteKey}/files/${folderName}`;
const fileName = 'myfile.png';

// Both scripts are guarded, so this also pre-cleans what a previous run left behind.
const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

const visitFolder = () => {
    cy.login(editor.username, editor.password);
    return JContent.visit(siteKey, 'en', `media/files/${folderName}`);
};

describe('Replace a file with another one', () => {
    before(() => {
        removeFixtures();
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editor.username, 'USER');
        addNode({parentPathOrId: `/sites/${siteKey}/files`, name: folderName, primaryNodeType: 'jnt:folder'});
        uploadFile('/assets/uploadMedia/myfile.png', folderPath, fileName, 'image/png');
        uploadFile('/assets/uploadMedia/myfile2.png', folderPath, 'myfile2.png', 'image/png');
        // Modified only shows on a node that has a live version to differ from.
        publishAndWaitJobEnding(folderPath, ['en']);
    });

    after(() => {
        removeFixtures();
        cy.logout();
    });

    it('The context menu of a file offers Replace with', () => {
        context.tag('jcontent', 'upload', 'replace-with-menu');
        const jcontent = visitFolder();

        jcontent.getGrid().getCardByName(fileName).contextMenu().shouldHaveRoleItem('replaceFile');
    });

    it('Replacing a file uploads a new version in place', () => {
        context.tag('jcontent', 'upload', 'replace-new-version');
        const jcontent = visitFolder();
        const grid = jcontent.getGrid();
        const cards = '[data-cm-role="grid-content-list-card"]';
        grid.getCardByName(fileName).get().find('[data-sel-role="content-status"][data-status-type="published"]').should('exist');
        cy.get(cards).should('have.length', 2);

        grid.getCardByName(fileName).contextMenu().selectByRole('replaceFile');
        cy.get('#file-upload-input').selectFile('cypress/fixtures/assets/uploadMedia/myfile2.png', {force: true});
        cy.get('[data-cm-role="upload-status-success"]', {timeout: 30000}).should('be.visible');
        cy.get('[data-cm-role="upload-close-button"]').click();

        cy.get(cards).should('have.length', 2);
        grid.getCardByName(fileName).get()
            .find('[data-sel-role="content-status"][data-status-type="modified"]')
            .should('be.visible')
            // A card shows the status as an icon chip, so its name is in the tooltip.
            .and('have.attr', 'title')
            .and('contain', 'Modified');
    });
});
