import {JContent} from '../../page-object';
import {enableModule} from '@jahia/cypress';

describe('Create and edit content type', () => {
    let jcontent: JContent;
    const siteKey = 'expertContentSite';
    const systemName = 'my-expert';

    before(() => {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    // Regression test for https://github.com/Jahia/jcontent/issues/2392
    it('creates a cent:expert and edits it', () => {
        // --- Create ---
        const contentEditor = jcontent.createContent('cent:expert');
        cy.get('#contenteditor-dialog-title').should('be.visible');

        // Deterministic system name so the node can be located afterwards
        contentEditor.openSection('options').get().find('input[type="text"]').clear().type(systemName);

        contentEditor.openSection('content');
        contentEditor.getSmallTextField('cent:expert_name').addNewValue('Original name');

        contentEditor.create();
        jcontent.getTable().getRowByName(systemName).should('exist');

        // --- Edit ---
        const editor = jcontent.editComponentByRowName(systemName);
        editor.switchToAdvancedMode();

        // Value persisted from creation
        cy.get('input[name="cent:expert_name"]').should('have.value', 'Original name');

        // Update the field and save
        editor.getSmallTextField('cent:expert_name').addNewValue('Updated name');
        editor.save();

        cy.get('input[name="cent:expert_name"]').should('have.value', 'Updated name');
    });
});
