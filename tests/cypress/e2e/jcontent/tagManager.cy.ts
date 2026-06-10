import {addNode, createSite, deleteSite, deleteNode, enableModule} from '@jahia/cypress';
import {TagManager} from '../../page-object';

describe('Tag Manager', () => {
    const siteKey = 'tagManagerTest';
    const contentRootPath = `/sites/${siteKey}/contents/tagmanager-e2e`;
    const alphaPath = `${contentRootPath}/alpha`;
    const betaPath = `${contentRootPath}/beta`;
    const specialTag = 'ù^$ùç_"(_çt"à\'çr(';
    const commonTag = 'tm-e2e-common';
    const alphaTag = 'tm-e2e-alpha';
    const specialRenamedTag = 'tm-e2e-special-renamed';
    const localRenamedTag = 'tm-e2e-alpha-local';
    const bulkRenamedTag = 'tm-e2e-renamed';

    const visitTagManager = () => TagManager.visit(siteKey, 'en');

    const createTestContent = () => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'tagmanager-e2e',
            primaryNodeType: 'jnt:contentList',
            children: [
                {
                    name: 'alpha',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:tagged'],
                    properties: [
                        {name: 'jcr:title', value: 'Tag Alpha', language: 'en'},
                        {name: 'j:tagList', values: [alphaTag, commonTag]}
                    ]
                },
                {
                    name: 'beta',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:tagged'],
                    properties: [
                        {name: 'jcr:title', value: 'Tag Beta', language: 'en'},
                        {name: 'j:tagList', values: [commonTag]}
                    ]
                },
                {
                    name: 'gamma',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:tagged'],
                    properties: [
                        {name: 'jcr:title', value: 'Tag Gamma', language: 'en'},
                        {name: 'j:tagList', values: [specialTag]}
                    ]
                }
            ]
        });
    };

    before(function () {
        deleteSite(siteKey);
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('tags', siteKey);
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(function () {
        deleteNode(contentRootPath);
        createTestContent();
        cy.loginAndStoreSession();
    });

    it('supports view usages, rename and delete for special-character tags', () => {
        const tagManager = TagManager.openFromAdditionalApps(siteKey, 'en');

        cy.get('.moonstone-header').should('contain', 'Manage Tags');

        tagManager.search('ù^$ùç_').openUsages(specialTag);

        tagManager.getDrawer().should('be.visible').and('contain', 'Tag Gamma');

        tagManager.closeDrawer();
        tagManager.getDrawer().should('not.be.visible');

        tagManager.openRename(specialTag).fillRenameDialog(specialRenamedTag).confirmRename();
        tagManager.clearSearch();
        tagManager.getRow(specialRenamedTag).should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', specialTag).should('not.exist');

        tagManager.search(specialRenamedTag).openDelete(specialRenamedTag).confirmDelete();
        cy.contains('[data-cm-role="tag-manager-row"]', specialRenamedTag).should('not.exist');
    });

    it('renames a tag on a single content item from the side panel', () => {
        const tagManager = visitTagManager();

        tagManager.search(alphaTag).openUsages(alphaTag).openEditNodeTag(alphaPath)
            .fillEditNodeDialog(localRenamedTag)
            .confirmEditNode();

        tagManager.clearSearch();
        tagManager.getRow(localRenamedTag).should('be.visible');
        cy.get('[data-cm-role="tag-manager-row"]')
            .filter((_, el) => el.getAttribute('data-tag-name') === alphaTag)
            .should('not.exist');
        tagManager.getDrawer().should('not.be.visible');
    });

    it('renames and deletes a site tag from the table', () => {
        const tagManager = visitTagManager();

        tagManager.search(commonTag).openRename(commonTag).fillRenameDialog(bulkRenamedTag).confirmRename();
        tagManager.clearSearch();

        tagManager.getRow(bulkRenamedTag).should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', commonTag).should('not.exist');

        tagManager.openDelete(bulkRenamedTag).confirmDelete();
        cy.contains('[data-cm-role="tag-manager-row"]', bulkRenamedTag).should('not.exist');
    });

    it('removes a tag from one content item with confirmation from the side panel', () => {
        const tagManager = visitTagManager();

        tagManager.search(commonTag).openUsages(commonTag).openDeleteNodeTag(betaPath).confirmDeleteNode();

        tagManager.getDrawerItem(alphaPath).should('exist');
        tagManager.getDrawerItem(betaPath).should('not.exist');
        tagManager.getRow(commonTag).should('contain', '1');
    });

    it('opens the side panel below the header and closes it from the drawer action', () => {
        const tagManager = visitTagManager();

        tagManager.search(commonTag).openUsages(commonTag);
        tagManager.getDrawer().should('be.visible');
        tagManager.closeDrawer();
        tagManager.getDrawer().should('not.be.visible');
    });
});
