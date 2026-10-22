import {JContent} from '../../../page-object';
import {RichTextField, SmallTextField} from '../../../page-object/fields';
import {ContentEditor} from '../../../page-object';
import {
    addNode,
    addPage,
    breakAclInheritance,
    createRole,
    createSite,
    createUser,
    deleteRole,
    deleteSite,
    deleteUser,
    getNodeByPath,
    grantRoles
} from '@jahia/cypress';

describe('permissions', () => {
    const siteKey = 'editorPermsSite';
    const editorLogin = {username: 'editorUser', password: 'password'};
    let jcontent: JContent;
    let contentEditor;

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(editorLogin.username, editorLogin.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editorLogin.username, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            primaryNodeType: 'jnt:bigText',
            name: 'test'
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editorLogin.username);
    });

    it('can edit rich text with editor', function () {
        cy.loginAndStoreSession(editorLogin.username, editorLogin.password);
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
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
    const subPage = (name: string) => ({
        name,
        primaryNodeType: 'jnt:page',
        properties: [{name: 'jcr:title', value: name, language: 'en'}, {name: 'j:templateName', value: 'simple'}]
    });

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
        // A page to rename, with two sub-pages to reorder in the same save
        addPage({parentPathOrId: homePath, name: 'toRename', template: 'simple', title: 'To rename', language: 'en', children: [
            subPage('x'), subPage('y')
        ]});
        // A page whose only sub-page is hidden from the editor
        addPage({parentPathOrId: homePath, name: 'allHidden', template: 'simple', title: 'All hidden', language: 'en', children: [
            subPage('secret')
        ]});
        // A page whose first and last sub-pages are read-only for the editor
        addPage({parentPathOrId: homePath, name: 'lockEnds', template: 'simple', title: 'Lock ends', language: 'en', children: [
            subPage('lockFirst'), subPage('m1'), subPage('m2'), subPage('m3'), subPage('lockLast')
        ]});
        grantRoles(homePath, ['editor'], editorLogin.username, 'USER');
        breakAclInheritance(`${homePath}/hidden`);
        breakAclInheritance(`${homePath}/readOnly`);
        breakAclInheritance(`${homePath}/allHidden/secret`);
        grantRoles(`${homePath}/readOnly`, ['reviewer'], editorLogin.username, 'USER');
        ['lockFirst', 'lockLast'].forEach(name => {
            breakAclInheritance(`${homePath}/lockEnds/${name}`);
            grantRoles(`${homePath}/lockEnds/${name}`, ['reviewer'], editorLogin.username, 'USER');
        });
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

    it('should refuse a direct reorder while a sub-page is hidden', () => {
        cy.apolloClient({username: editorLogin.username, password: editorLogin.password});
        cy.apollo({mutation: gql`
            mutation reorderAsEditor {
                jcr {
                    mutateNode(pathOrId: "${homePath}") {
                        reorderMovableChildren(names: ["D", "B", "readOnly", "A"])
                    }
                }
            }
        `}).then((result: {message?: string}) => {
            expect(result.message).to.contain('hidden from the current user');
        });
        cy.apolloClient();

        subPageOrder().should('deep.eq', subPages);
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

    it('should disable the moves that would cross a locked sub-page at an end of the list', () => {
        loginAsEditor();
        const ce = JContent.visit(siteKey, 'en', 'pages/home/lockEnds').editPage();
        const listOrdering = () => ce.getSection('listOrdering').get();

        listOrdering().scrollIntoView();
        listOrdering().find('[data-sel-role="locked-child"]').should('have.length', 2);
        listOrdering().contains('[draggable]', 'm1').find('[data-sel-action^="moveUp"]').should('have.attr', 'disabled');
        listOrdering().contains('[draggable]', 'm1').find('[data-sel-action^="moveToFirst"]').should('have.attr', 'disabled');
        listOrdering().contains('[draggable]', 'm3').find('[data-sel-action^="moveDown"]').should('have.attr', 'disabled');
        listOrdering().contains('[draggable]', 'm3').find('[data-sel-action^="moveToLast"]').should('have.attr', 'disabled');
        listOrdering().contains('[draggable]', 'm2').find('[data-sel-action^="moveUp"]').click({force: true});
        ce.save();

        getNodeByPath(`${homePath}/lockEnds`, [], 'en', ['jnt:page']).then(result => {
            expect(result.data.jcr.nodeByPath.children.nodes.map((node: {name: string}) => node.name)).to.deep.eq(['lockFirst', 'm2', 'm1', 'm3', 'lockLast']);
        });
    });

    it('should tell the editor that the only sub-page is hidden', () => {
        loginAsEditor();
        const ce = JContent.visit(siteKey, 'en', 'pages/home/allHidden').editPage();
        const listOrdering = () => ce.getSection('listOrdering').get();

        listOrdering().scrollIntoView();
        listOrdering().find('[draggable]').should('not.exist');
        listOrdering().find('[data-sel-role="hidden-children-message"]')
            .should('contain', '1 item is not visible to you, so you cannot reorder the list.');
    });

    it('should rename a page and reorder its sub-pages in the same save', () => {
        cy.login();
        const ce = JContent.visit(siteKey, 'en', 'pages/home/toRename').editPage();
        ce.getSmallTextField('nt:base_ce:systemName', false).addNewValue('renamed');
        const listOrdering = () => ce.getSection('listOrdering').get();
        listOrdering().scrollIntoView();
        listOrdering().contains('[draggable]', 'y').find('[data-sel-action^="moveToFirst"]').click({force: true});
        ce.save();

        getNodeByPath(`${homePath}/renamed`, [], 'en', ['jnt:page']).then(result => {
            expect(result.data.jcr.nodeByPath.children.nodes.map((node: {name: string}) => node.name)).to.deep.eq(['y', 'x']);
        });
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

    // Copy translator role (with the "publication-start" permission removed) and its user
    const grantedRole = 'translator-copy-translator-en';
    const translatorCopyUser = {username: 'translatorCopyUser', password: 'password'};
    const contentName = 'translatorCopyPublicationTest';
    let contentUuid: string;

    before(() => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(translatorLogin.username, translatorLogin.password);
        grantRoles(`/sites/${siteKey}`, ['translator-fr'], translatorLogin.username, 'USER');
        createUser(translatorCopyUser.username, translatorCopyUser.password);

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            primaryNodeType: 'jnt:bigText',
            name: contentName,
            properties: [{name: 'text', value: 'Publication permission test', language: 'en'}]
        }).then(result => {
            contentUuid = result.data.jcr.addNode.uuid;
        });
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('contentEditor/permissions/deleteTranslatorCopyRole.groovy');
        deleteUser(translatorCopyUser.username);
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

    it('should not allow a translator with no publication rights to publish content', () => {
        // Copy the translator role and grant the copied English sub-role to the test user here
        // (not in before) so the copy cannot affect the real translator-fr role used above.
        cy.executeGroovy('contentEditor/permissions/copyTranslatorRoleWithoutPublication.groovy');
        grantRoles(`/sites/${siteKey}`, [grantedRole], translatorCopyUser.username, 'USER');

        // The copied role and its grantable English sub-role should have been created
        getNodeByPath('/roles/translator-copy', [], undefined, ['jnt:role']).then(result => {
            const role = result.data.jcr.nodeByPath;
            expect(role, 'translator-copy role').to.not.be.null;
            const subRoleNames = role.children.nodes.map((node: {name: string}) => node.name);
            expect(subRoleNames, 'copied sub-roles').to.include(grantedRole);
        });

        // Log in as the translator-copy user
        cy.loginAndStoreSession(translatorCopyUser.username, translatorCopyUser.password);
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${siteKey},uilang:en,uuid:'${contentUuid}')))`;
        cy.visit(`/jahia/jcontent/${siteKey}/en/content-folders/contents#${ceParams}`);
        const ce = ContentEditor.getContentEditor();

        // Save is visible but disabled
        ce.checkButtonStatus('submitSave', false);

        // All publication action buttons are unavailable
        cy.get('[data-sel-role="publishAction"]').should('not.exist');
        cy.get('[data-sel-role="startWorkflowMainButton"]').should('not.exist');
    });
});
