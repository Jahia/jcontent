import {JContent} from '../../../page-object';
import {RichTextField, SmallTextField} from '../../../page-object/fields';
import {ContentEditor} from '../../../page-object';
import {addNode, createSite, createUser, deleteSite, deleteUser, getNodeByPath, grantRoles} from '@jahia/cypress';

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
