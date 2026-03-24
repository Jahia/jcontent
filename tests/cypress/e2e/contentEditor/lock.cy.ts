import {ContentEditor, JContent} from '../../page-object';
import {
    addNode,
    Button,
    deleteSite,
    getComponentByRole,
    grantRoles,
    lockNode
} from '@jahia/cypress';

describe('Lock in content editor tests', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorLockSite';

    before(() => {
        cy.executeGroovy('contentEditor/contentMultiLanguage/contentMultiLanguageSite.groovy', {SITEKEY: siteKey});
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], 'anne', 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'Delete me',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'Lock me',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'Lock me in all languages',
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', value: 'Lock EN', language: 'en'},
                {name: 'text', value: 'Lock FR', language: 'fr'}
            ]
        });
        lockNode(`/sites/${siteKey}/contents/Lock me`);
        lockNode(`/sites/${siteKey}/contents/Lock me in all languages`);
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should display lock badge on marked for deletion content', () => {
        jcontent.getTable().getRowByName('Delete me').contextMenu().select('Delete');
        getComponentByRole(Button, 'delete-mark-button').click();

        jcontent.editComponentByRowName('Delete me');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        cy.get('div[data-sel-role="lock-info-badge"]').should('be.visible');
        contentEditor.cancel();
    });

    it('should not display lock badge when current user is the locker', () => {
        jcontent.editComponentByRowName('Lock me');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        cy.get('div[data-sel-role="lock-info-badge"]').should('not.exist');
        contentEditor.cancel();
    });

    it('should display lock badge when current user is not the locker', () => {
        cy.logout();
        cy.login('anne', 'password');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.editComponentByRowName('Lock me');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        cy.get('div[data-sel-role="lock-info-badge"]')
            .should('be.visible')
            .and('contain', 'Locked by root');
        contentEditor.cancel();
        cy.logout();
    });

    it('should display ready only fields when locked', () => {
        cy.logout();
        cy.login('anne', 'password');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.editComponentByRowName('Lock me');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        cy.get('div[data-sel-role="lock-info-badge"]')
            .should('be.visible')
            .and('contain', 'Locked by root');
        cy.get('div[data-sel-role="read-only-badge"]').should('be.visible');
        contentEditor.cancel();
        cy.logout();
    });

    it('should still be locked after editing', () => {
        jcontent.editComponentByRowName('Lock me');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Update my lock');
        contentEditor.save();
        contentEditor.cancel();

        cy.logout();
        cy.login('anne', 'password');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.editComponentByRowName('Lock me');
        contentEditor.switchToAdvancedMode();
        cy.get('div[data-sel-role="lock-info-badge"]')
            .should('be.visible')
            .and('contain', 'Locked by root');
        contentEditor.cancel();
        cy.logout();
    });

    it('should display lock badge in all languages', () => {
        cy.logout();
        cy.login('anne', 'password');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        jcontent.editComponentByRowName('Lock me in all languages');
        const contentEditor = new ContentEditor();
        cy.get('div[data-sel-role="lock-info-badge"]')
            .should('be.visible')
            .and('contain', 'Locked by root');
        contentEditor.getLanguageSwitcher().select('French');
        cy.get('div[data-sel-role="lock-info-badge"]')
            .should('be.visible')
            .and('contain', 'Locked by root');
        contentEditor.cancel();
        cy.logout();
    });
});
