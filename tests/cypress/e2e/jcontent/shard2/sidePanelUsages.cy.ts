import {JContent, SidePanel} from '../../../page-object';
import {addNode} from '@jahia/cypress';

describe('jContent side panel usages tab', () => {
    const sidePanel = new SidePanel();

    before(() => {
        addNode({
            parentPathOrId: '/sites/digitall/contents',
            name: 'jc-usages-empty-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'jc-usages-empty-text', language: 'en'}]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        cy.apollo({
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents/jc-usages-empty-text'
            }
        });
    });

    it('displays the usages of the selected item in the side panel', () => {
        const jcontent = JContent.visit('digitall', 'en', 'media/files/images/banners');
        // Editing-digitall-site.jpg has 3 usages in digitall out of the box
        jcontent.switchToListMode().getTable().getRowByName('editing-digitall-site.jpg').contextMenu().select('Preview');

        sidePanel.getByRole('side-panel').should('be.visible');
        sidePanel.getByRole('tab-usages').should('be.visible');
        sidePanel.switchToUsagesTab();

        sidePanel.getUsagesTable().should('be.visible');
        sidePanel.getUsagesRows().should('have.length.at.least', 1);

        // Each row shows the compact publication status bar
        sidePanel.getUsagesRows().first()
            .find('[data-cm-role="publication-info"]')
            .should('have.attr', 'data-cm-value');

        // Each row has the standard three-dot content actions menu
        sidePanel.getUsagesRows().first()
            .find('[data-sel-role="contentItemActionsMenu"]')
            .click();
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .should('be.visible')
            .and('contain.text', 'Edit');
        cy.get('.moonstone-menu_overlay').click();
    });

    it('displays the empty state for an item without usages', () => {
        const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('jc-usages-empty-text').contextMenu().select('Preview');

        sidePanel.getByRole('tab-usages').should('be.visible');
        sidePanel.switchToUsagesTab();
        sidePanel.getByRole('usages-empty').should('contain.text', 'No usages');
    });
});
