import {addNode, createSite, deleteSite, getComponent} from '@jahia/cypress';
import {JContent, JContentPageBuilder} from '../../page-object';
import {DeleteDialog, DeletePermanentlyDialog} from '../../page-object/deleteDialog';

describe('Page builder - content manipulation', () => {
    const siteKey = 'contentManipulationSite';
    const homePath = `/sites/${siteKey}/home`;
    const areaName = 'area-main';
    const areaPath = `${homePath}/${areaName}`;
    const contentListName = 'test-content-list';
    const contentListPath = `${areaPath}/${contentListName}`;
    const bigTextName = 'test-big-text';

    let jcontent: JContentPageBuilder;

    before(() => {
        createSite(siteKey);

        // Pre-create the full structure used by the test:
        // home / area-main (area list) / test-content-list / test-big-text
        addNode({
            parentPathOrId: homePath,
            name: areaName,
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:isAreaList'],
            children: [{
                name: contentListName,
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: bigTextName,
                    primaryNodeType: 'jnt:bigText',
                    properties: [{name: 'text', language: 'en', value: 'Some rich text content'}]
                }]
            }]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
    });

    /**
     * This checks for potential regression of https://github.com/Jahia/jcontent/issues/2297
     * where permanently deleting a marked-for-deletion content list that is currently
     * selected (blue border) used to throw an error and break the parent area.
     */
    it('Permanently deletes a selected, marked-for-deletion content list without breaking the area', () => {
        jcontent.getModule(areaPath).get().scrollIntoView();

        cy.log('Mark the content list for deletion');
        jcontent.getModule(contentListPath, false)
            .contextMenu(true, false)
            .select('Delete');
        getComponent(DeleteDialog).markForDeletion();

        // Refresh jcontent
        jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        cy.log('Verify the content list is marked for deletion');
        jcontent.getModule(contentListPath).getForDeletionStatus().should('be.visible');

        cy.log('Click the marked-for-deletion content list to select it (blue border)');
        const markedModule = jcontent.getModule(contentListPath, false);
        cy.log('Permanently delete the selected content list');
        markedModule.contextMenu(true, true).select('Delete (permanently)');
        getComponent(DeletePermanentlyDialog).delete();

        cy.log('Verify no error occurred and the main area is still visible');
        jcontent.getModule(areaPath).get().should('be.visible');
    });

    /**
     * Right-clicking an empty area (nothing selected, no selectable content under the cursor)
     * must not fall back to the page. It previously opened a context menu targeting the page,
     * so "Delete" removed the whole page. Desired behavior: if nothing is selected or selectable,
     * the page should not be selected by default.
     */
    it('Does not target the page when right-clicking an empty area with nothing selected', () => {
        cy.log('Nothing is selected initially');
        cy.get('[data-sel-role="selection-infos"]').should('not.exist');

        cy.log('Right-click the page area without hovering or selecting any content');
        jcontent.getMainModule(homePath).get().rightclick('topLeft', {force: true});

        cy.log('The context menu must not open (it used to target the page)');
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden)').should('not.exist');

        cy.log('And the page must not become selected');
        cy.get('[data-sel-role="selection-infos"]').should('not.exist');
    });
});
