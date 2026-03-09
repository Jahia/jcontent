import {JContent} from '../../page-object/jcontent';
import {addNode} from "@jahia/cypress";

describe('test jcontent actionbar', () => {
    let jcontent: JContent;
    const siteKey = 'actionsBarSite';

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-content-folder',
            primaryNodeType: 'jnt:contentFolder'
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    it('test actionbar', () => {
        jcontent = JContent.visit('digitall', 'en', 'pages/home/about');
        cy.get('div[role="toolbar"]').find('[data-sel-role="refresh"]').should('exist');
        cy.get('div[role="toolbar"]').find('[data-sel-role="jnt:page"]').should('exist');
        jcontent.selectAccordion('content-folders');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContentFolder"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContent"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="refresh"]').should('exist');
        jcontent.selectAccordion('media');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createFolder"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="fileUpload"]').should('exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="refresh"]').should('exist');
    });

    it('Checks actions inside 3 dots menu of a page in jcontent header', () => {
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        const contextMenu = jcontent.getBrowseControlMenu();
        const items = [
            'Export',
            'Delete',
            'Lock',
            'Show in Repository Explorer',
            'Clear page cache'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });

    it('Checks actions inside 3 dots menu of a content folder in jcontent header', function () {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/my-content-folder');
        const contextMenu = jcontent.getBrowseControlMenu();
        const items = [
            'Export',
            'Delete',
            'Lock',
            'Import content'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });

    it('Checks actions inside 3 dots menu of a media folder in jcontent header', function () {
        jcontent = JContent.visit(siteKey, 'en', 'media/files/bootstrap');
        jcontent.switchToListMode();
        const contextMenu = jcontent.getBrowseControlMenu();
        const items = [
            'Rename',
            'Delete',
            'Lock',
            'Download as zip'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });
});
