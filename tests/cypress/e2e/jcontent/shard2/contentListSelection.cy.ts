// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650).

import {addNode, context, createSite, createUser, deleteUser, grantRoles, uploadFile} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const siteKey = 'contentListSelectionSite';
const editor = {username: 'contentListSelectionEditor', password: 'password'};
const contentCount = 21;
const contentNames = Array.from({length: contentCount}, (_, i) => `text-${String(i + 1).padStart(2, '0')}`);
const images = ['image-one.png', 'image-two.png'];

const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

const openHomeList = (): JContent => {
    const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    jcontent.switchToListMode();
    return jcontent;
};

const openImagesList = (): JContent => {
    const jcontent = JContent.visit(siteKey, 'en', 'media/files/images');
    jcontent.switchToListMode();
    return jcontent;
};

const getSelectionInfo = () => cy.get('[data-sel-role="selection-infos"]');

const openContextMenu = (jcontent: JContent, rowName: string) => {
    const menu = jcontent.getTable().getRowByName(rowName).contextMenu();
    // The menu renders skeleton items until its actions are resolved
    menu.get().find('[data-sel-role="menu-item-skeleton"]').should('not.exist');
    return menu;
};

describe('Content list selection', () => {
    before(() => {
        removeFixtures();
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
            languages: 'en'
        });
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editor.username, 'USER');

        // An area is not editorial content, so the list of Home shows only the texts inside it.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'area-main',
            primaryNodeType: 'jnt:area',
            children: contentNames.map((name, i) => ({
                name,
                primaryNodeType: 'jnt:text',
                properties: [{name: 'text', value: `Text ${i + 1}`, language: 'en'}]
            }))
        });

        addNode({
            parentPathOrId: `/sites/${siteKey}/files`,
            name: 'images',
            primaryNodeType: 'jnt:folder'
        });
        uploadFile('/assets/uploadMedia/myfile.png', `/sites/${siteKey}/files/images`, images[0], 'image/png');
        uploadFile('/assets/uploadMedia/myfile2.png', `/sites/${siteKey}/files/images`, images[1], 'image/png');
    });

    after(() => {
        cy.logout();
        removeFixtures();
    });

    beforeEach(() => {
        cy.loginAndStoreSession(editor.username, editor.password);
    });

    it('Selecting rows shows the selection count', () => {
        context.tag('jcontent', 'multiple-selection', 'selection-count');
        const table = openHomeList().getTable();

        table.selectRowByName(contentNames[0]);
        table.selectRowByName(contentNames[1]);
        table.selectRowByName(contentNames[2]);
        table.selectRowByName(contentNames[2], false);

        getSelectionInfo().should('contain', '2 items selected');
    });

    it('Row actions are hidden while several rows are selected', () => {
        context.tag('jcontent', 'multiple-selection', 'hover-actions');
        const table = openHomeList().getTable();
        // Without a selection, the row carries its actions
        table.getRowByName(contentNames[0]).get()
            .find('[data-cm-role="table-content-list-cell-actions"] button')
            .should('exist');
        table.selectRowByName(contentNames[0]);
        table.selectRowByName(contentNames[1]);

        table.getRowByName(contentNames[0]).get().realHover();

        table.getRowByName(contentNames[0]).get()
            .find('[data-cm-role="table-content-list-cell-actions"] button')
            .should('not.exist');
    });

    it('Select all toggles the whole list', () => {
        context.tag('jcontent', 'multiple-selection', 'select-all');
        openHomeList();
        getSelectionInfo().should('not.exist');
        const selectAll = () => cy.get('[data-cm-role="table-content-list-header-cell-selection"] input').click();

        selectAll();
        getSelectionInfo()
            .should('contain', `${contentCount} items selected`)
            .and('have.attr', 'data-sel-selection-size', String(contentCount));
        selectAll();

        getSelectionInfo().should('not.exist');
    });

    it('Changing page clears the selection', () => {
        context.tag('jcontent', 'multiple-selection', 'pagination-clears');
        const jcontent = openHomeList();
        cy.get('[data-sel-role="table-pagination-dropdown-rows-per-page"]').click();
        cy.contains('menu.moonstone-menu [role="option"]', /^10$/).click();
        cy.get('[data-cm-role="table-content-list-row"]').should('have.length', 10);
        jcontent.getTable().selectRowByName(contentNames[0]);
        getSelectionInfo().should('be.visible');

        cy.get('[data-sel-role="table-pagination-button-next-page"]').click();

        getSelectionInfo().should('not.exist');
    });

    it('The multi-selection context menu hides single-item actions', () => {
        context.tag('jcontent', 'multiple-selection', 'context-menu-multi');
        const jcontent = openImagesList();
        jcontent.getTable().selectRowByName(images[0]);
        jcontent.getTable().selectRowByName(images[1]);

        const menu = openContextMenu(jcontent, images[1]);

        menu.get().find('[data-sel-role="copy"]').should('be.visible');
        menu.get().find('[data-sel-role="edit"]').should('not.exist');
    });

    it('The single-item context menu offers Edit again', () => {
        context.tag('jcontent', 'multiple-selection', 'context-menu-single');
        const jcontent = openImagesList();
        jcontent.getTable().selectRowByName(images[0]);
        jcontent.getTable().selectRowByName(images[1]);
        jcontent.getTable().selectRowByName(images[1], false);
        jcontent.getTable().selectRowByName(images[0], false);
        getSelectionInfo().should('not.exist');

        const menu = openContextMenu(jcontent, images[1]);

        menu.get().find('[data-sel-role="copy"]').should('be.visible');
        menu.get().find('[data-sel-role="edit"]').should('be.visible');
    });
});
