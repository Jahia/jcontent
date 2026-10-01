import {JContent} from '../../../page-object';
import {addNode, createSite, createUser, deleteNode, deleteSite, deleteUser, grantRoles} from '@jahia/cypress';

describe('Component permission in content editor', () => {
    const siteKey = 'componentPermissionSite';
    const restrictedRole = 'editor-without-components';
    const editor = {username: 'componentsEditor', password: 'password'};
    const restrictedEditor = {username: 'noComponentsEditor', password: 'password'};

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.executeGroovy('contentEditor/componentPermission/createEditorWithoutComponentsRole.groovy');
        createUser(editor.username, editor.password);
        createUser(restrictedEditor.username, restrictedEditor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');
        grantRoles(`/sites/${siteKey}`, [restrictedRole], restrictedEditor.username, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'restricted-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Restricted text', language: 'en'}]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editor.username);
        deleteUser(restrictedEditor.username);
        deleteNode(`/roles/${restrictedRole}`);
    });

    afterEach(() => {
        cy.logout();
    });

    it('can edit content when the user has the component permission of its type', () => {
        cy.loginAndStoreSession(editor.username, editor.password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('restricted-text');
        contentEditor.getSmallTextField('jnt:text_text').get().find('input').should('not.have.attr', 'readonly');
        cy.get('div[data-sel-role="read-only-badge"]').should('not.exist');
        contentEditor.cancel();
    });

    it('opens content read-only when the user lacks the component permission of its type', () => {
        cy.loginAndStoreSession(restrictedEditor.username, restrictedEditor.password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('restricted-text');
        contentEditor.getSmallTextField('jnt:text_text').get().find('input').should('have.attr', 'readonly', 'readonly');
        cy.get('div[data-sel-role="read-only-badge"]').should('be.visible');
        contentEditor.checkButtonStatus('submitSave', false);
        contentEditor.cancel();
    });
});
