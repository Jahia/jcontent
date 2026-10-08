import {JContent} from '../../../page-object';
import {addNode, createSite, createUser, deleteNode, deleteSite, deleteUser, grantRoles, markForDeletion} from '@jahia/cypress';

describe('Component permission', () => {
    const siteKey = 'componentPermissionSite';
    const restrictedRole = 'editor-without-basic-content';
    const editor = {username: 'componentsEditor', password: 'password'};
    const restrictedEditor = {username: 'noBasicContentEditor', password: 'password'};

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.executeGroovy('contentEditor/componentPermission/createEditorWithoutBasicContentRole.groovy');
        createUser(editor.username, editor.password);
        createUser(restrictedEditor.username, restrictedEditor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');
        grantRoles(`/sites/${siteKey}`, [restrictedRole], restrictedEditor.username, 'USER');
        // Needs component-jmix_basicContent, the one permission the restricted role lacks
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'restricted-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Restricted text', language: 'en'}]
        });
        // Needs component-jmix_listContent, which the restricted role keeps
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allowed-list',
            primaryNodeType: 'jnt:contentList',
            properties: [{name: 'jcr:title', value: 'Allowed list', language: 'en'}]
        });
        // Needs no component permission
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allowed-folder',
            primaryNodeType: 'jnt:contentFolder',
            properties: [{name: 'jcr:title', value: 'Allowed folder', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'deleted-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Deleted text', language: 'en'}]
        });
        markForDeletion(`/sites/${siteKey}/contents/deleted-text`);
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

    const checkEditable = (rowName: string, fieldName: string) => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName(rowName);
        contentEditor.getSmallTextField(fieldName).get().find('input').should('not.have.attr', 'readonly');
        cy.get('div[data-sel-role="read-only-badge"]').should('not.exist');
        contentEditor.cancel();
    };

    const checkMenuItems = (rowName: string, roles: string[], visible: boolean) => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        const menu = jcontent.getTable().getRowByName(rowName).contextMenu();
        // Edit is always there, so the menu has loaded once it shows
        menu.shouldHaveRoleItem('edit');
        menu.get().find('[data-sel-role="menu-item-skeleton"]').should('not.exist');
        roles.forEach(role => (visible ? menu.shouldHaveRoleItem(role) : menu.shouldNotHaveRoleItem(role)));
        menu.close();
    };

    it('can edit content when the user has the component permission of its type', () => {
        cy.loginAndStoreSession(editor.username, editor.password);
        checkEditable('restricted-text', 'jnt:text_text');
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

    it('can edit content when the user keeps the component permission of its type', () => {
        cy.loginAndStoreSession(restrictedEditor.username, restrictedEditor.password);
        checkEditable('allowed-list', 'jnt:contentList_jcr:title');
    });

    it('can edit content whose type needs no component permission', () => {
        cy.loginAndStoreSession(restrictedEditor.username, restrictedEditor.password);
        checkEditable('allowed-folder', 'jnt:contentFolder_jcr:title');
    });

    it('shows delete, copy and cut when the user has the component permission of the type', () => {
        cy.loginAndStoreSession(editor.username, editor.password);
        checkMenuItems('restricted-text', ['delete', 'copy', 'cut'], true);
        checkMenuItems('deleted-text', ['undelete', 'deletePermanently'], true);
    });

    it('hides delete, copy and cut when the user lacks the component permission of the type', () => {
        cy.loginAndStoreSession(restrictedEditor.username, restrictedEditor.password);
        checkMenuItems('restricted-text', ['delete', 'copy', 'cut'], false);
        checkMenuItems('deleted-text', ['undelete', 'deletePermanently'], false);
    });

    it('shows delete, copy and cut on the types the user keeps or that need no component permission', () => {
        cy.loginAndStoreSession(restrictedEditor.username, restrictedEditor.password);
        checkMenuItems('allowed-list', ['delete', 'copy', 'cut'], true);
        checkMenuItems('allowed-folder', ['delete', 'copy', 'cut'], true);
    });
});
