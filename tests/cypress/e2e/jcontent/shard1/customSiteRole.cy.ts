import {
    context,
    createRole,
    createSite,
    createUser,
    deleteRole,
    deleteSite,
    deleteUser,
    grantRoles,
    jfaker
} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor, CreateContent, JContent} from '../../../page-object';
import {ChoiceListField, SmallTextField} from '../../../page-object/fields';

// A user whose only role is a custom site role, with the permissions that the Selenium class
// CustomSiteRoleTest checked in Roles and permissions (Jahia/selenium#1644).
describe('Custom site role', () => {
    const prefix = 'customsiterole';
    const uniq = jfaker.string.alphanumeric({length: 8, casing: 'lower'});
    const siteKey = prefix + uniq;
    const sitePath = `/sites/${siteKey}`;
    const roleName = prefix + 'publishers' + uniq;
    const userName = prefix + 'user' + uniq;
    const password = 'password';
    const pageName = 'page' + uniq;
    const richText = 'Rich text of ' + uniq;

    // The permissions that rolesmanager stores on a site role for the checkboxes of the legacy test:
    // Publish and All basic permissions, jContent, the rich text editor toolbar, Components and Templates.
    const permissions = ['publish', 'jcr:all_default', 'jContent', 'wysiwyg-editor-toolbar', 'components', 'templates'];

    const deleteStaleFixtures = () => {
        cy.apollo({
            query: gql`
                query staleFixtures($userQuery: String!) {
                    jcr {
                        sites: nodeByPath(path: "/sites") { children { nodes { name } } }
                        roles: nodeByPath(path: "/roles") { children { nodes { name } } }
                        users: nodesByQuery(query: $userQuery) { nodes { name } }
                    }
                }
            `,
            variables: {userQuery: `select * from [jnt:user] where localname() like '${prefix}%'`}
        }).then(result => {
            const names = (nodes: {name: string}[]) => nodes.map(node => node.name).filter(name => name.startsWith(prefix));
            names(result.data.jcr.sites.children.nodes).forEach(name => deleteSite(name));
            names(result.data.jcr.roles.children.nodes).forEach(name => deleteRole(name));
            names(result.data.jcr.users.nodes).forEach(name => deleteUser(name));
        });
    };

    // Leaves jContent by navigating to the logout URL. With cy.logout() under the open app, the session of
    // the next login often ended on its first visit, with the "session ended" dialog.
    const leaveJContent = () => cy.visit('/cms/logout', {failOnStatusCode: false});

    const verifyNavigationOf = (login: () => void, navItem: string, shouldExist: boolean) => {
        login();
        JContent.visit(siteKey, 'en', 'pages/home');
        cy.get('li[data-registry-key="primary-nav-item:jcontent"]').should('be.visible');
        cy.get(`li[data-registry-key="primary-nav-item:${navItem}"]`).should(shouldExist ? 'exist' : 'not.exist');
        leaveJContent();
    };

    before(() => {
        deleteStaleFixtures();
        createSite(siteKey, {languages: 'en', templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        createRole({name: roleName, roleGroup: 'site-role', permissions, privilegedAccess: true});
        createUser(userName, password, [{name: 'preferredLanguage', value: 'en'}]);
        grantRoles(sitePath, [roleName], userName, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(userName);
        deleteRole(roleName);
    });

    it('has no Category Manager entry in the primary navigation', () => {
        context.tag('admin', 'roles', 'custom-role-no-category-manager', 'testrail-case-2213943');
        verifyNavigationOf(() => cy.login(userName, password), 'category-manager', false);
        // Control: root sees the entry on the same screen
        verifyNavigationOf(() => cy.login(), 'category-manager', true);
    });

    it('has no Repository Explorer entry in the primary navigation', () => {
        context.tag('admin', 'roles', 'custom-role-no-repository-explorer', 'testrail-case-2213943');
        verifyNavigationOf(() => cy.login(userName, password), 'repository-explorer', false);
        // Control: root sees the entry on the same screen
        verifyNavigationOf(() => cy.login(), 'repository-explorer', true);
    });

    it('creates a page with a rich text and publishes it to live', () => {
        context.tag('admin', 'roles', 'custom-role-contribute-publish', 'testrail-case-2213943');
        cy.login(userName, password);

        let jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('New Page');
        const pageEditor = ContentEditor.getContentEditor();
        pageEditor.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue(pageName);
        pageEditor.getField(ChoiceListField, 'jmix:hasTemplateNode_j:templateName').addNewValue('simple');
        pageEditor.create();

        jcontent = JContent.visit(siteKey, 'en', `pages/home/${pageName}`);
        jcontent.switchToPageBuilder().getModule(`${sitePath}/home/${pageName}/area-main`)
            .getCreateButtons().getButton('New content').click();
        const textEditor = new CreateContent(jcontent).getContentTypeSelector()
            .searchForContentType('jnt:bigText').selectContentType('jnt:bigText').create();
        textEditor.getRichTextField('jnt:bigText_text').type(richText);
        textEditor.create();

        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        cy.get('[data-sel-role="publishMenu"]').click();
        jcontent.publishAll();
        leaveJContent();

        cy.visit(`/cms/render/live/en${sitePath}/home/${pageName}.html`);
        cy.contains(richText).should('be.visible');
    });
});
