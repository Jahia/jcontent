import {ContentEditor, JContent} from '../../../page-object';
import {Button, getComponentByRole} from '@jahia/cypress';

describe('Workflows entry in the modes dropdown', () => {
    const nodePath = '/sites/digitall/home/area-main/highlights/people-first';
    let contentEditor: ContentEditor;
    let jcontent: JContent;

    beforeEach(() => {
        cy.loginAndStoreSession();
        contentEditor = ContentEditor.visit(nodePath, 'digitall', 'en', 'pages/home');
        jcontent = new JContent();
    });

    it('Should show the Workflows entry in an Advanced options section of the modes dropdown', () => {
        cy.get('[data-sel-role="sel-view-mode-dropdown"][data-sel-tab]').click();
        cy.get('[data-option-type="group"]').contains('Advanced options').should('be.visible');
        cy.get('[data-sel-role="tab-workflows"]').should('be.visible');
    });

    it('Should open the GWT workflow modal directly when there are no unsaved changes', () => {
        contentEditor.openWorkflowsFromModesDropdown();
        cy.get('#JahiaGxtEditEngineTabs').should('be.visible');
        cy.get('button.x-btn-text').contains('Cancel').click();
        cy.get('#JahiaGxtEditEngineTabs').should('not.exist');
        // Opening the workflow modal must not change the selected mode
        jcontent.assertHeaderActionSelected('tab-edit');
    });

    it('Should ask for confirmation when there are unsaved changes', () => {
        contentEditor.getSmallTextField('jdnt:highlight_description', false).addNewValue('Modified description', true);

        // Continue editing: modal stays closed, changes are kept
        contentEditor.openWorkflowsFromModesDropdown();
        getComponentByRole(Button, 'close-dialog-cancel').click();
        cy.get('#JahiaGxtEditEngineTabs').should('not.exist');
        contentEditor.getSmallTextField('jdnt:highlight_description', false).checkValue('Modified description');

        // Discard: changes are dropped and the workflow modal opens
        contentEditor.openWorkflowsFromModesDropdown();
        getComponentByRole(Button, 'close-dialog-discard').click();
        cy.get('#JahiaGxtEditEngineTabs').should('be.visible');
        cy.get('button.x-btn-text').contains('Cancel').click();
    });

    it('Should still open GWT tabs from the advanced options panel', () => {
        // Regression check for the openEngineTabsAction refactoring
        jcontent.selectHeaderTab('tab-advanced-options');
        jcontent.assertHeaderActionSelected('tab-advanced-options');
        cy.get('[data-sel-role="advanced-options-nav"] li').contains('Workflow').click();
        cy.get('#JahiaGxtEditEngineTabs').should('be.visible');
        cy.get('button.x-btn-text').contains('Cancel').click();
    });
});
