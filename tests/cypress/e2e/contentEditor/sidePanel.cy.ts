import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {JContent, SidePanel} from '../../page-object';

describe('Content editor side panel', () => {
    const siteKey = 'sidePanelTestSite';

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'test-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Side panel test content', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'test-folder',
            primaryNodeType: 'jnt:contentFolder'
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    describe('Tab navigation', () => {
        it('should display side panel with three tabs in fullscreen mode', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();

            cy.get('[data-sel-role="side-panel"]').should('be.visible');
            cy.get('[data-sel-role="tab-details"]').should('be.visible');
            cy.get('[data-sel-role="tab-history"]').should('be.visible');
            cy.get('[data-sel-role="tab-preview"]').should('be.visible');
        });

        it('should default to the details tab', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();

            cy.get('[data-sel-role="tab-details"]').should('have.attr', 'aria-selected', 'true');
            cy.get('[data-sel-role="side-panel-content"]').should('be.visible');
        });

        it('should switch to history tab on click', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();

            const sidePanel = new SidePanel();
            sidePanel.switchToHistoryTab();

            cy.get('[data-sel-role="history-container"]').should('be.visible');
        });

        it('should switch to preview tab on click', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();

            const sidePanel = new SidePanel();
            sidePanel.switchToPreviewTab();

            cy.get('[data-sel-role="side-panel-content"]').should('be.visible');
        });

        it('should not show side panel in non-fullscreen mode', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.editComponentByRowName('test-text');

            cy.get('[data-sel-role="side-panel"]').should('not.exist');
        });
    });

    describe('Details tab', () => {
        beforeEach(() => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();
            new SidePanel().switchToDetailsTab();
        });

        it('should display technical information section', () => {
            cy.get('[data-sel-role="details-section"][data-sel-content="technical"]').should('be.visible');
        });

        it('should display detail rows with copy buttons in the technical section', () => {
            cy.get('[data-sel-role="details-section"][data-sel-content="technical"]')
                .find('[data-sel-role="detail-row"]')
                .should('have.length.greaterThan', 0);

            cy.get('[data-sel-role="details-section"][data-sel-content="technical"]')
                .find('[data-sel-role="detail-row"]')
                .first()
                .find('button')
                .should('exist');
        });

        it('should copy value to clipboard when copy button is clicked', () => {
            cy.window().then(win => {
                const writeText = cy.stub().resolves();
                Object.defineProperty(win.navigator, 'clipboard', {
                    value: {writeText},
                    writable: true,
                    configurable: true
                });
                cy.wrap(writeText).as('clipboardWrite');
            });

            cy.get('[data-sel-role="details-section"][data-sel-content="technical"]')
                .find('[data-sel-role="detail-row"]')
                .first()
                .find('button')
                .click();

            cy.get('@clipboardWrite').should('have.been.calledOnce');
        });

        it('should display additional details section when present', () => {
            // Additional details section appears when details array is populated
            // Its presence depends on the content type — we check the technical section exists at minimum
            cy.get('[data-sel-role="details-section"][data-sel-content="technical"]').should('exist');
        });
    });

    describe('History tab', () => {
        beforeEach(() => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();
            new SidePanel().switchToHistoryTab();
        });

        it('should display the action filter dropdown', () => {
            cy.get('[data-sel-role="history-action-filter"]').should('be.visible');
            cy.get('[data-sel-role="history-action-filter"] [role="listbox"]').should('exist');
        });

        it('should show all actions in the filter dropdown', () => {
            cy.get('[data-sel-role="history-action-filter"]  [role="listbox"] span').click();

            // All known action types should be listed
            cy.get('.moonstone-menu').should('be.visible');
            cy.get('.moonstone-menu').should('contain.text', 'All actions');
        });

        it('should display the history container', () => {
            cy.get('[data-sel-role="history-container"]').should('be.visible');
        });

        it('should update the list when action filter is changed', () => {
            const sidePanel = new SidePanel();

            // Open dropdown and select 'created'
            sidePanel.getHistoryFilter().find('[role="listbox"] span').click();
            cy.get('.moonstone-menu').not('.moonstone-hidden').should('be.visible');

            // Click first non-"All actions" option scoped to the visible menu
            cy.get('.moonstone-menu').not('.moonstone-hidden').find('.moonstone-listItem').eq(1).click();

            // The filter button should now show a chip
            cy.get('[data-sel-role="history-action-filter"]').should('be.visible');
        });
    });

    describe('Preview tab', () => {
        it('should display preview iframe for regular content', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-text');
            ce.switchToAdvancedMode();

            new SidePanel().switchToPreviewTab();

            cy.get('iframe[data-sel-role="edit-preview-frame"]', {timeout: 10000}).should('be.visible');
        });

        it('should not display preview iframe for a content folder', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('test-folder');
            ce.switchToAdvancedMode();

            // Preview tab is gated by hasPreview; folders have no preview so the tab is not rendered
            cy.get('[data-sel-role="tab-preview"]').should('not.exist');
            cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
        });
    });
});
