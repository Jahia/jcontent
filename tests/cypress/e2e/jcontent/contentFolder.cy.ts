import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';

describe('Content folders tests', () => {
    const siteKey = 'contentFolderTestSite';

    before(() => {
        createSite(siteKey);
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'folder-to-dblclick', primaryNodeType: 'jnt:contentFolder'});
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'folder-to-delete', primaryNodeType: 'jnt:contentFolder'});
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'existing-folder', primaryNodeType: 'jnt:contentFolder'});
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'parent-folder', primaryNodeType: 'jnt:contentFolder'});
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.login();
    });

    it('open content folders correctly', () => {
        const jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
        jcontent.getAccordionItem('content-folders').click();
        cy.get('span').contains('Content Folder').should('exist');
        cy.get('div[data-sel-role="sel-view-mode-dropdown"]').contains('List').should('exist');
    });

    it('should create a new folder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createFolder('new-folder').get().should('be.visible');
    });

    it('should create a folder with special characters in the name', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createFolder('test-éàöäè¨ç').get().should('be.visible');
    });

    it('should not create a folder with an already existing name', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type('existing-folder');
        cy.get('[data-cm-role="create-folder-as-confirm"]').should('be.disabled');
        cy.get('#folder-name-helper-text').should('contain', 'A folder with this name already exists');
    });

    it('should enter the folder with double click', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        // It looks like table is shifting here when loading and dblclick is targeting the wrong row. Add a loader check here.
        cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
        jcontent.getTable().getRowByName('folder-to-dblclick').dblclick();
        cy.get('h1').should('contain', 'folder-to-dblclick');
    });

    it('should create a sub-folder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/parent-folder');
        jcontent.createFolder('sub-folder').get().should('be.visible');
    });

    it('should delete a folder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('folder-to-delete')
            .markForDeletion()
            .deletePermanently();
    });
});
