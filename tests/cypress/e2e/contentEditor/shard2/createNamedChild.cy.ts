import {
    addNode,
    createRole,
    createSite,
    createUser,
    deleteRole,
    deleteSite,
    deleteUser,
    enableModule,
    getNodeByPath,
    grantRoles
} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../../page-object';

describe('Create a named child node', () => {
    const siteKey = 'createNamedChildSite';
    const areaPath = `/sites/${siteKey}/home/named-child-page/my-area`;
    const editor = {username: 'namedChildEditor', password: 'password'};
    // The permissions of the editor role without viewOptionsTab, so the form of this user has no system name field
    const roleName = 'editor-without-options';

    const createFromContextMenu = (parentName: string, action: string) => {
        JContent.visit(siteKey, 'en', 'pages/home/named-child-page')
            .switchToStructuredView()
            .getTable()
            .getRowByLabel(parentName)
            .contextMenu()
            .select(action);
        new ContentEditor().create();
    };

    const childNames = (parentName: string, types: string[] = ['jnt:content']) =>
        getNodeByPath(`${areaPath}/${parentName}`, [], 'en', types).then(result =>
            result.data.jcr.nodeByPath.children.nodes.map(node => node.name)
        );

    before(() => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        deleteUser(editor.username);
        deleteRole(roleName, {errorPolicy: 'all'});
        createRole({
            name: roleName,
            roleGroup: 'edit-role',
            privilegedAccess: true,
            permissions: [
                'api-access',
                'jcr:read_default',
                'jcr:write_default',
                'jcr:readAccessControl_default',
                'jcr:lockManagement_default',
                'jcr:versionManagement_default',
                'jcr:nodeTypeManagement_default',
                'jcr:retentionManagement_default',
                'jcr:lifecycleManagement_default',
                'move',
                'publication-start',
                'siteAdminUrlmapping',
                'publication-finish-correction'
            ],
            sitePermissions: [
                'components',
                'pageComposerAccess',
                'jContentAccess',
                'jContentActions',
                'managers',
                'templates',
                'view-basic-wysiwyg-editor',
                'viewCategoriesTab',
                'viewContentTab',
                'viewLayoutTab',
                'viewMetadataTab',
                'viewSeoTab',
                'viewVisibilityTab',
                'jContentAccordions',
                'viewVanityUrlModal'
            ]
        });

        createSite(siteKey, {
            languages: 'en',
            templateSet: 'jcontent-test-template',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, [roleName], editor.username, 'USER');

        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'named-child-page',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Named child page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [
                {
                    name: 'my-area',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:isAreaList'],
                    children: [
                        {name: 'restricted-named', primaryNodeType: 'cent:twoChildObjectsOneMultiple'},
                        {name: 'root-named', primaryNodeType: 'cent:twoChildObjectsOneMultiple'},
                        {name: 'restricted-wildcard', primaryNodeType: 'cent:twoChildObjectsOneMultiple'}
                    ]
                }
            ]
        });
    });

    after(() => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        deleteUser(editor.username);
        deleteRole(roleName);
    });

    it('saves a named child under its declared name when the system name field is not in the form', () => {
        cy.loginAndStoreSession(editor.username, editor.password);
        createFromContextMenu('restricted-named', 'New childObject1');

        childNames('restricted-named').should('deep.equal', ['childObject1']);
    });

    it('saves a named child under its declared name when the system name field is in the form', () => {
        cy.loginAndStoreSession();
        createFromContextMenu('root-named', 'New childObject2');

        childNames('root-named').should('deep.equal', ['childObject2']);
    });

    it('saves a child of a residual definition under a generated name when the system name field is not in the form', () => {
        cy.loginAndStoreSession(editor.username, editor.password);
        createFromContextMenu('restricted-wildcard', 'New childObject3');

        childNames('restricted-wildcard', ['cent:childObject3']).should('have.length', 1);
    });
});
