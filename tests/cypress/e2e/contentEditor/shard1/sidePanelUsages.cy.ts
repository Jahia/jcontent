import {ContentEditor, JContent, SidePanel} from '../../../page-object';
import {addNode, createUser, deleteUser, grantRoles} from '@jahia/cypress';

describe('Content editor side panel usages tab', () => {
    const ceSidePanel = new SidePanel().inCE();

    before(() => {
        cy.apollo({
            mutationFile: 'contentEditor/usages/createUsages.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents'
            }
        });
        addNode({
            parentPathOrId: '/sites/digitall/contents',
            name: 'side-panel-usages-empty-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'side-panel-usages-empty-text', language: 'en'}]
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
                pathOrId: '/sites/digitall/contents/ce-usages-contents'
            }
        });
        cy.apollo({
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents/side-panel-usages-empty-text'
            }
        });
    });

    it('displays the usages tab with the deduplicated list of usages', () => {
        const jcontent = JContent.visit('digitall', 'en', 'media/files/images/backgrounds');
        jcontent.switchToListMode().getTable().getRowByName('boy-father.jpg').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        ceSidePanel.getByRole('tab-usages').should('be.visible');
        ceSidePanel.switchToUsagesTab();

        ceSidePanel.getUsagesTable().should('be.visible');
        // 18 usages deduplicated to 16 rows (one usage is referenced in en/de/fr)
        ceSidePanel.getUsagesRows().should('have.length', 16);
        // The multi-language usage shows overflowing language chips (2 shown + '+1')
        ceSidePanel.getUsagesTable().should('contain.text', '+1');

        // Each row shows the compact publication status bar
        ceSidePanel.getUsagesRows().first()
            .find('[data-cm-role="publication-info"]')
            .should('have.attr', 'data-cm-value');

        // Each row has the standard three-dot content actions menu
        ceSidePanel.getUsagesRows().first()
            .find('[data-sel-role="contentItemActionsMenu"]')
            .click();
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .should('be.visible')
            .and('contain.text', 'Edit');
        cy.get('.moonstone-menu_overlay').click();
    });

    it('displays the empty state when the content has no usages', () => {
        const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('side-panel-usages-empty-text');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        ceSidePanel.switchToUsagesTab();
        ceSidePanel.getByRole('usages-empty').should('contain.text', 'No usages');
    });

    describe('permission enforcement', () => {
        const permissionTester = {username: 'usagesPermTester', password: 'Usages_Perm_1!'};

        before(() => {
            cy.loginAndStoreSession();
            createUser(permissionTester.username, permissionTester.password);
            grantRoles('/sites/digitall', ['editor'], permissionTester.username, 'USER');
        });

        after(() => {
            cy.loginAndStoreSession();
            cy.executeGroovy('contentEditor/usages/removeUsagesPermission.groovy');
            deleteUser(permissionTester.username);
        });

        const openEmptyTextInAdvancedMode = () => {
            const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
            jcontent.editComponentByRowName('side-panel-usages-empty-text');
            new ContentEditor().switchToAdvancedMode();
        };

        it('hides the Usages tab when the user lacks the viewUsagesTab permission', () => {
            cy.loginAndStoreSession(permissionTester.username, permissionTester.password);
            openEmptyTextInAdvancedMode();

            ceSidePanel.getByRole('side-panel').should('be.visible');
            ceSidePanel.getByRole('tab-details').should('be.visible');
            ceSidePanel.getByRole('tab-usages').should('not.exist');
        });

        it('shows the Usages tab once the viewUsagesTab permission is granted', () => {
            cy.loginAndStoreSession();
            cy.executeGroovy('contentEditor/usages/addUsagesPermission.groovy');

            cy.loginAndStoreSession(permissionTester.username, permissionTester.password);
            openEmptyTextInAdvancedMode();

            ceSidePanel.getByRole('tab-usages').should('be.visible');
        });
    });
});
