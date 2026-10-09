import {addNode, context, createSite, createUser, deleteSite, deleteUser, grantRoles} from '@jahia/cypress';
import {JContent, TAG_MANAGER_APP_KEY, TagManager} from '../../../page-object';

describe('Tag Manager permissions', () => {
    const siteKey = 'tagManagerPermissions';
    const password = 'password';
    // The editor role gives access to the Additional section but not the tagManager permission
    const editor = 'tagManagerEditor';
    // Only the site-administrator role grants tagManager, through its site-admin permission group
    const siteAdmin = 'tagManagerSiteAdmin';
    const tag = 'permission-tag';
    const renamedTag = 'permission-tag-renamed';

    before(() => {
        deleteSite(siteKey);
        deleteUser(editor);
        deleteUser(siteAdmin);
        createSite(siteKey, {
            templateSet: 'jcontent-test-template',
            serverName: 'localhost',
            locale: 'en'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'tagged-content',
            primaryNodeType: 'jnt:text',
            mixins: ['jmix:tagged'],
            properties: [
                {name: 'text', value: 'Tagged content', language: 'en'},
                {name: 'j:tagList', values: [tag]}
            ]
        });
        createUser(editor, password);
        createUser(siteAdmin, password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor, 'USER');
        grantRoles(`/sites/${siteKey}`, ['site-administrator'], siteAdmin, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editor);
        deleteUser(siteAdmin);
    });

    afterEach(() => {
        cy.logout();
    });

    it('does not list the Tag Manager in Additional for a user without the tagManager permission', () => {
        context.tag('tags', 'tag-manager', 'permissions', 'no-access');
        cy.loginAndStoreSession(editor, password);
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');

        const apps = jcontent.getAccordionItem('apps');
        apps.click();

        // The editor still has other Additional apps, so wait for the tree before checking what it lacks
        apps.getTreeItems().should('have.length.greaterThan', 0);
        apps.shouldNotHaveTreeItem(TAG_MANAGER_APP_KEY);
        cy.get('[data-cm-role="tag-manager-root"]').should('not.exist');
    });

    it('does not open the Tag Manager from its URL for a user without the tagManager permission', () => {
        context.tag('tags', 'tag-manager', 'permissions', 'no-access');
        cy.loginAndStoreSession(editor, password);

        JContent.visit(siteKey, 'en', `apps/${TAG_MANAGER_APP_KEY}`);

        cy.contains('App not found', {timeout: 30000}).should('be.visible');
        cy.get('[data-cm-role="tag-manager-root"]').should('not.exist');
    });

    it('lets a user with the tagManager permission open the Tag Manager and rename a tag', () => {
        context.tag('tags', 'tag-manager', 'permissions', 'access');
        cy.loginAndStoreSession(siteAdmin, password);

        const tagManager = TagManager.openFromAdditionalApps(siteKey, 'en');
        tagManager.getRow(tag).should('contain', '1');

        tagManager.openRename(tag).fillRenameDialog(renamedTag).confirmRename();

        tagManager.getRow(renamedTag).should('contain', '1');
        // The renamed tag contains the old name, so match the row by its exact tag name
        cy.get(`[data-cm-role="tag-manager-row"][data-tag-name="${tag}"]`).should('not.exist');
    });
});
