import {JContent} from '../page-object';
import {Button, getComponentBySelector} from '@jahia/cypress';

describe('Multi-selection tests', {testIsolation: false}, () => {
    let jcontent;

    before(function () {
        cy.loginEditor(); // Edit in chief
        jcontent = JContent.visit('digitall', 'en', 'media/files');
        jcontent.switchToListMode();
    });

    afterEach(() => {
        cy.get('body').then(body => {
            if (body.find('.moonstone-header button[data-sel-role="clearSelection"]').length) {
                jcontent.clearSelection();
            }
        });
    });

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
