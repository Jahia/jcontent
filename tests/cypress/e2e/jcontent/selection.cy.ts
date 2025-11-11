import {JContent} from '../../page-object';
import {Button, getComponentBySelector} from '@jahia/cypress';
import {addNode, deleteNode} from '@jahia/cypress';

describe('Multi-selection tests', {testIsolation: false}, () => {
    let jcontent: JContent;

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

    const checkNoSelection = () => {
        cy.get('[data-sel-role="selection-infos"]').should('not.exist');
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
            jcontent.getTable().selectRowByName('images');
            jcontent.getTable().selectRowByName('video');
            jcontent.clearSelection();
            cy.get('[data-sel-role="selection-infos"]').should('not.exist');
            jcontent.getTable().selectRowByName('images');
        });

        it('Can select/de-select items in list mode', () => {
            cy.log('selection: 1');
            jcontent.getTable().selectRowByName('images');
            checkSelectionCount(1);
            checkToolbar();

            cy.log('selection: 2');
            jcontent.getTable().selectRowByName('video');
            checkSelectionCount(2);
            checkToolbar();

            // Unselect item
            cy.log('unselecting item');
            jcontent.getTable().selectRowByName('images', false);
            checkSelectionCount(1);
            checkToolbar();
        });

        it('Can select/de-select items in dropdown', () => {
            jcontent.getTable().selectRowByName('images');
            jcontent.getTable().selectRowByName('video');
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
            jcontent.getTable().selectRowByName('images');
            jcontent.getTable().selectRowByName('video');
            jcontent.getTable().get().type('{esc}');

            cy.get('[data-cm-role="selection-infos"]').should('not.exist');
        });

        it('Can select items with right-click', () => {
            jcontent.getTable().selectRowByName('images');
            jcontent.getTable().getRowByName('video').contextMenu().select('Add to selection');

            checkToolbar();
            checkSelectionCount(2);
        });

        it('should not show "add to selection" if nothing is selected', () => {
            jcontent.getTable().getRowByName('video').contextMenu().should('not.contain', 'Add to selection');
            cy.get('.moonstone-menu_overlay').click();
        });

        it('should show number of items selected in conrtext menu', () => {
            jcontent.getTable().selectRowByName('images');
            jcontent.getTable().getRowByName('images').contextMenu().should('contain', '1 item selected');
            cy.get('.moonstone-menu_overlay').click();
        });
    });

    describe('test selection in thumbnails view', () => {
        before(() => {
            cy.loginAndStoreSession(); // Edit in chief
            jcontent = JContent.visit('digitall', 'en', 'media/files/images/backgrounds');
            jcontent.switchToThumbnails();
        });

        afterEach(() => {
            clearSelection();
        });

        it('should not be able to select item with click', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').get().click();
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldNotBeSelected();
            checkNoSelection();
        });

        it('should be able to select item with meta click', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('forest-woman.jpg').get().click();
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldBeSelected();
            jcontent.getGrid().getCardByName('forest-woman.jpg').shouldNotBeSelected();
            checkSelectionCount(1);
        });

        it('should select multiple', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('forest-woman.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldBeSelected();
            jcontent.getGrid().getCardByName('forest-woman.jpg').shouldBeSelected();
            checkSelectionCount(2);
        });

        it('should be able to unselect', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('forest-woman.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('forest-woman.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldBeSelected();
            jcontent.getGrid().getCardByName('forest-woman.jpg').shouldNotBeSelected();
            checkSelectionCount(1);
        });

        it('should have dedicated context menu', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('forest-woman.jpg').contextMenu().select('Add to selection');
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldBeSelected();
            jcontent.getGrid().getCardByName('forest-woman.jpg').shouldBeSelected();
            checkSelectionCount(2);
        });

        it('should not select anything if preview is opened', () => {
            jcontent.getGrid().getCardByName('fans-stadium.jpg').contextMenu().select('Preview');
            jcontent.getGrid().getCardByName('forest-woman.jpg').get().click({cmdKey: true});
            jcontent.getGrid().getCardByName('fans-stadium.jpg').shouldNotBeSelected();
            jcontent.getGrid().getCardByName('forest-woman.jpg').shouldBeSelected();
            checkNoSelection();
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
            ct.selectRowByName('how-to-use-this-demo');
            ct.selectRowByName('our-companies');
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
            jcontent.getTable().selectRowByName('global-network-rich-text');

            jcontent.switchToStructuredView();
            checkSelectionCount(1);
            jcontent.getTable().getRowByName('global-network-rich-text');
        });

        it('remove selection when navigating to a mode where item is not visible', () => {
            const pageBuilder = jcontent.switchToPageBuilder();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');

            /**
             * There is no way to get to the area-main header through clicking
             * (clicking will bring up rich text header instead) in order to select.
             * As a workaround, we go through the rich text and select area-main using footer.
             * Then use the selector from parentFrame to check the checkbox (we cannot use module here).
             */
            const module = pageBuilder.getModule('/sites/digitall/home/area-main/area/area/area/area-main/global-network-rich-text', false);
            module.click(); // Bring up footer
            const dropdown = module.getFooter().getItemPathDropdown();
            dropdown.open();
            dropdown.select('area-main');
            module.parentFrame.get().find('[data-clicked="true"]').click({force: true, metaKey: true});
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
            jcontent.getTable().selectRowByName('bootstrap');
            checkSelectionCount(1);

            cy.log('check selection is cleared for empty folder');
            jcontent.getAccordionItem('media').getTreeItem(folderName).click();
            cy.get('.moonstone-loader', {timeout: 5000}).should('not.exist');
            cy.get('[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Does not show modify actions if in multiselection and jahia area is selected', () => {
            cy.log('select item');
            jcontent = JContent.visit('digitall', 'en', 'pages/home').switchToStructuredView();
            jcontent.getTable().selectRowByName('bootstrap-container');
            checkSelectionCount(1);
            cy.get('[data-sel-role="delete"]').should('exist');
            cy.get('[data-sel-role="copy"]').should('exist');
            cy.get('[data-sel-role="cut"]').should('exist');

            jcontent.getTable().selectRowByName('landing');
            checkSelectionCount(2);
            cy.get('[data-sel-role="delete"]').should('not.exist');
            cy.get('[data-sel-role="copy"]').should('not.exist');
            cy.get('[data-sel-role="cut"]').should('not.exist');
        });
    });
});
