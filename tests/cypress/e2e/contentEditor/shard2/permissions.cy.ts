import {JContent} from '../../../page-object';
import {RichTextField, SmallTextField} from '../../../page-object/fields';
import gql from 'graphql-tag';
import {ContentEditor} from '../../../page-object';
import {
    addNode,
    breakAclInheritance,
    createRole,
    createSite,
    createUser,
    deleteNode,
    deleteRole,
    deleteSite,
    deleteUser,
    getNodeByPath,
    grantRoles
} from '@jahia/cypress';

describe('permissions', () => {
    let jcontent: JContent;
    let contentEditor;

    before(() => {
        cy.apollo({mutation: gql`
                mutation createContent {
                    jcr {
                        mutateNode(pathOrId: "/sites/digitall/contents") {
                            addChild(name: "test", primaryNodeType: "jnt:bigText") {
                                grantRoles(principalName: "bill", principalType:USER, roleNames: "editor")
                                mutateChildren(names: "j:acl") {
                                    mutateProperty(name: "j:inherit") {
                                        setValue(value: "false")
                                    }
                                }
                            }
                        }
                    }
                }
            `});
    });

    after(() => {
        deleteNode('/sites/digitall/contents/test');
    });

    it('can edit rich text with editor', function () {
        cy.loginAndStoreSession('bill', 'password');
        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        contentEditor = jcontent.editComponentByText('test');
        const richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
        richText.type('test');
    });
});

describe('page editor without write access on a sub-page', () => {
    const siteKey = 'subPagePermsSite';
    const editorLogin = {username: 'homeEditor', password: 'password'};
    const homePath = `/sites/${siteKey}/home`;
    const subPages = ['A', 'B', 'hidden', 'readOnly', 'D'];

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(editorLogin.username, editorLogin.password);
        // An area before the sub-pages, as a rendered home page has
        addNode({parentPathOrId: homePath, name: 'main', primaryNodeType: 'jnt:contentList'});
        subPages.forEach(name => addNode({
            parentPathOrId: homePath,
            name,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: name, language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ]
        }));
        grantRoles(homePath, ['editor'], editorLogin.username, 'USER');
        breakAclInheritance(`${homePath}/hidden`);
        breakAclInheritance(`${homePath}/readOnly`);
        grantRoles(`${homePath}/readOnly`, ['reviewer'], editorLogin.username, 'USER');
    });

    // The cy.apollo command authenticates as root in the browser session, so a stored editor session would come back as root
    const loginAsEditor = () => cy.login(editorLogin.username, editorLogin.password);

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editorLogin.username);
    });

    it('should save the home page title and keep the sub-page order', () => {
        loginAsEditor();
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('Edit');
        const ce = new ContentEditor();

        ce.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue('Home edited');
        ce.save();

        getNodeByPath(homePath, ['jcr:title'], 'en').then(result => {
            const titleProp = result.data.jcr.nodeByPath.properties.find((prop: {name: string}) => prop.name === 'jcr:title');
            expect(titleProp.value).to.eq('Home edited');
        });
        subPageOrder().should('deep.eq', subPages);
    });

    it('should show the read-only sub-page locked and count the hidden sub-page', () => {
        loginAsEditor();
        const ce = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        const listOrdering = () => ce.getSection('listOrdering').get();

        listOrdering().scrollIntoView();
        listOrdering().find('[data-sel-role="locked-child"]').should('have.length', 1);
        listOrdering().find('[data-sel-role="hidden-children-message"]')
            .should('contain', '1 item is not visible to you, so you cannot reorder the list.');
        listOrdering().find('[data-sel-action^="moveToLast"]').should('not.exist');
    });

    it('should keep the read-only sub-pages in place when the editor moves another sub-page', () => {
        // With read access, the hidden sub-page becomes a second read-only sub-page
        grantRoles(`${homePath}/hidden`, ['reviewer'], editorLogin.username, 'USER');
        loginAsEditor();
        const ce = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        const listOrdering = () => ce.getSection('listOrdering').get();

        listOrdering().scrollIntoView();
        listOrdering().find('[data-sel-role="locked-child"]').should('have.length', 2);
        // The move buttons show on hover only
        listOrdering().contains('[draggable]', 'A').find('[data-sel-action^="moveToLast"]').click({force: true});
        ce.save();

        subPageOrder().should('deep.eq', ['B', 'D', 'hidden', 'readOnly', 'A']);
    });

    // Returns the order of the sub-pages of this test, read as root
    const subPageOrder = () => getNodeByPath(homePath, [], 'en', ['jnt:page']).then(result => result.data.jcr.nodeByPath.children.nodes
        // The template set adds its own pages under the home page
        .map((node: {name: string}) => node.name)
        .filter((name: string) => subPages.includes(name)));
});

describe('sub-page privileges that a reorder needs', () => {
    const siteKey = 'reorderPrivilegesSite';
    const editorLogin = {username: 'reorderEditor', password: 'password'};
    const homePath = `/sites/${siteKey}/home`;
    const subPages = ['A', 'removeNodeOnly', 'childNodesOnly', 'D'];
    // Jackrabbit moves a child only with jcr:addChildNodes and jcr:removeChildNodes on that child
    const roles = {
        removeNodeOnly: {name: 'reorderRemoveNodeOnly', permissions: ['jcr:read_default', 'jcr:removeNode_default']},
        childNodesOnly: {name: 'reorderChildNodesOnly', permissions: ['jcr:read_default', 'jcr:addChildNodes_default', 'jcr:removeChildNodes_default']}
    };

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(editorLogin.username, editorLogin.password);
        subPages.forEach(name => addNode({
            parentPathOrId: homePath,
            name,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: name, language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ]
        }));
        grantRoles(homePath, ['editor'], editorLogin.username, 'USER');
        Object.entries(roles).forEach(([page, role]) => {
            createRole({name: role.name, roleGroup: 'edit-role', permissions: role.permissions, privilegedAccess: true});
            breakAclInheritance(`${homePath}/${page}`);
            grantRoles(`${homePath}/${page}`, [role.name], editorLogin.username, 'USER');
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editorLogin.username);
        Object.values(roles).forEach(role => deleteRole(role.name));
    });

    it('should lock only the sub-page that Jackrabbit refuses to move', () => {
        cy.login(editorLogin.username, editorLogin.password);
        const ce = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        const listOrdering = () => ce.getSection('listOrdering').get();

        listOrdering().scrollIntoView();
        listOrdering().find('[data-sel-role="locked-child"]').should('have.length', 1);
        listOrdering().contains('[draggable]', 'childNodesOnly').find('[data-sel-action^="moveToFirst"]').click({force: true});
        ce.save();

        getNodeByPath(homePath, [], 'en', ['jnt:page']).then(result => {
            // The template set adds its own pages under the home page
            const names = result.data.jcr.nodeByPath.children.nodes
                .map((node: {name: string}) => node.name)
                .filter((name: string) => subPages.includes(name));
            expect(names).to.deep.eq(['childNodesOnly', 'removeNodeOnly', 'A', 'D']);
        });
    });
});

describe('translator permissions', () => {
    const siteKey = 'translatorPermsSite';
    const translatorLogin = {username: 'frTranslator', password: 'password'};

    before(() => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(translatorLogin.username, translatorLogin.password);
        grantRoles(`/sites/${siteKey}`, ['translator-fr'], translatorLogin.username, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(translatorLogin.username);
    });

    beforeEach(() => {
        cy.loginAndStoreSession(translatorLogin.username, translatorLogin.password);
    });

    afterEach(() => {
        cy.logout();
    });

    it('should allow a translator to edit and save a page title in French', () => {
        const jcontent = JContent.visit(siteKey, 'fr', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('Edit');
        const ce = new ContentEditor();

        ce.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue('Accueil traduit');
        ce.save();

        getNodeByPath(`/sites/${siteKey}/home`, ['jcr:title'], 'fr').then(result => {
            const props = result.data.jcr.nodeByPath.properties;
            const titleProp = props.find((prop: {name: string}) => prop.name === 'jcr:title');
            expect(titleProp.value).to.eq('Accueil traduit');
        });
    });
});

