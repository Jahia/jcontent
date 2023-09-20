import {JContent} from '../../page-object';
import {Button, getComponentBySelector} from '@jahia/cypress';
import {addNode, deleteNode} from '@jahia/cypress';

describe('Multi-selection tests', {testIsolation: false}, () => {
    let jcontent;

    const clearSelection = () => {
        cy.get('body').then(body => {
            if (body.find('.moonstone-header button[data-sel-role="clearSelection"]').length) {
                jcontent.clearSelection();
            }
        });
    };

    const checkToolbar = () => {
        getComponentBySelector(Button,
            '[role="toolbar"] [data-sel-role="publishAll"]',
            null,
            e => expect(e).to.be.visible);
    };

    const checkSelectionCount = count => {
        cy.get('[data-sel-role="selection-infos"]')
            .should('have.attr', 'data-sel-selection-size')
            .and('equal', count.toString());
    };

    describe('test simple select/unselect on files', () => {
        before(function () {
            cy.loginAndStoreSession(); // Edit in chief
            jcontent = JContent.visit('digitall', 'en', 'media/files');
            jcontent.switchToListMode();
        });

        afterEach(() => {
            clearSelection();
        });

        it('Can clear selection', () => {
            jcontent.getTable().selectRowByLabel('images');
            jcontent.getTable().selectRowByLabel('video');
            jcontent.clearSelection();
            cy.get('[data-sel-role="selection-infos"]').should('not.exist');
            jcontent.getTable().selectRowByLabel('images');
        });

        it('Can select/de-select items in list mode', () => {
            cy.log('selection: 1');
            jcontent.getTable().selectRowByLabel('images');
            checkSelectionCount(1);
            checkToolbar();

            cy.log('selection: 2');
            jcontent.getTable().selectRowByLabel('video');
            checkSelectionCount(2);
            checkToolbar();

            // Unselect item
            cy.log('unselecting item');
            jcontent.getTable().selectRowByLabel('images', false);
            checkSelectionCount(1);
            checkToolbar();
        });

        it('Can select/de-select items in dropdown', () => {
            jcontent.getTable().selectRowByLabel('images');
            jcontent.getTable().selectRowByLabel('video');
            checkToolbar();
            checkSelectionCount(2);
            const selectionDropdown = jcontent.getSelectionDropdown();
            selectionDropdown.get().should('not.be.disabled');
            selectionDropdown.select('images');
            checkToolbar();
            checkSelectionCount(1);
            cy.get('.moonstone-menu_overlay').click();
        });

        it('Can select items in list mode and clear selection', () => {
            jcontent.getTable().selectRowByLabel('images');
            jcontent.getTable().selectRowByLabel('video');
            jcontent.getTable().get().type('{esc}');

            cy.get('[data-cm-role="selection-infos"]').should('not.exist');
        });

        it('Can select items with right-click', () => {
            jcontent.getTable().selectRowByLabel('images');
            jcontent.getTable().getRowByLabel('video').contextMenu().select('Add to selection');

            checkToolbar();
            checkSelectionCount(2);
        });

        it('should not show "add to selection" if nothing is selected', () => {
            jcontent.getTable().getRowByLabel('video').contextMenu().should('not.contain', 'Add to selection');
            cy.get('.moonstone-menu_overlay').click();
        });

        it('should show number of items selected in conrtext menu', () => {
            jcontent.getTable().selectRowByLabel('images');
            jcontent.getTable().getRowByLabel('images').contextMenu().should('contain', '1 item selected');
            cy.get('.moonstone-menu_overlay').click();
        });
    });

    describe('test selection when switching modes', () => {
        const folderName = 'folder1';

        before(function () {
            addNode({
                name: folderName,
                parentPathOrId: '/sites/digitall/files',
                primaryNodeType: 'jnt:folder'
            });
            cy.loginAndStoreSession(); // Edit in chief
            jcontent = JContent.visit('digitall', 'en', 'pages/home');
            jcontent.switchToListMode();
        });

        after(() => {
            deleteNode(`/sites/digitall/files/${folderName}`);
        });

        afterEach(() => {
            clearSelection();
        });

        it('Maintains selection when navigating back and forth from different modes', () => {
            // Select a couple of rows in list view
            const ct = jcontent.getTable();
            ct.selectRowByLabel('How to Use');
            ct.selectRowByLabel('Our Companies');
            checkSelectionCount(2);

            // Check selection in structured mode
            jcontent.switchToStructuredView();
            checkSelectionCount(2);

            // Check selection in PC mode
            jcontent.switchToPageBuilder();
            checkSelectionCount(2);

            jcontent.switchToListMode();
            checkSelectionCount(2);
        });

        it('opens selected items when navigating to structured view', () => {
            jcontent.getTable().selectRowByLabel('We are a global network');

            jcontent.switchToStructuredView();
            checkSelectionCount(1);
            jcontent.getTable().getRowByLabel('We are a global network');
        });

        it('remove selection when navigating to a mode where item is not visible', () => {
            const pageBuilder = jcontent.switchToPageBuilder();

            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            // Select absolute area
            const module = pageBuilder.getModule('/sites/digitall/home/area-main/area/area/area/area-main');
            module.click('bottom');
            checkSelectionCount(1);

            // Check selection in structured mode
            jcontent.switchToStructuredView();
            checkSelectionCount(1);

            // Check that selection is removed in list view
            jcontent.switchToListMode();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            cy.contains('1 previously selected');
        });

        it('remove selection when navigating to empty folder', () => {
            cy.log('select item');
            jcontent = JContent.visit('digitall', 'en', 'media/files').switchToListMode();
            jcontent.getTable().selectRowByLabel('bootstrap');
            checkSelectionCount(1);

            cy.log('check selection is cleared for empty folder');
            jcontent.getAccordionItem('media').getTreeItem(folderName).click();
            cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
            cy.get('[data-sel-role="selection-infos"]').should('not.exist');
        });
    });
});
