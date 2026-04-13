import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {TagManager} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';

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

    const createTaggedNode = (name: string, title: string, tags: Array<string>) => {
        GraphqlUtils.addNode(contentRootPath, 'jnt:contentList', name);
        GraphqlUtils.setProperty(`${contentRootPath}/${name}`, 'jcr:title', title, 'en');
        GraphqlUtils.addMixins(`${contentRootPath}/${name}`, ['jmix:tagged']);
        GraphqlUtils.setProperties(`${contentRootPath}/${name}`, 'j:tagList', tags, 'en');
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('tags', siteKey);

        GraphqlUtils.addNode(`/sites/${siteKey}/contents`, 'jnt:contentList', 'tagmanager-e2e');
        createTaggedNode('alpha', 'Tag Alpha', [alphaTag, commonTag]);
        createTaggedNode('beta', 'Tag Beta', [commonTag]);
        createTaggedNode('gamma', 'Tag Gamma', [specialTag]);
    });

    after(() => {
        GraphqlUtils.deleteNode(contentRootPath);
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('supports view usages, rename and delete for special-character tags', () => {
        const tagManager = TagManager.openFromAdditionalApps(siteKey, 'en');

        cy.get('.moonstone-header').should('contain', 'Tag manager');

        tagManager.search('ù^$ùç_').openUsages(specialTag);

        tagManager.getDrawer().should('be.visible').and('contain', 'Tag Gamma');

        tagManager.closeDrawerByClickAway();
        tagManager.getDrawer().should('not.exist');

        tagManager.openRename(specialTag).fillRenameDialog(specialRenamedTag).confirmRename();
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

        tagManager.getRow(localRenamedTag).should('be.visible');
        cy.contains('[data-cm-role="tag-manager-row"]', alphaTag).should('not.exist');
        tagManager.getDrawer().should('not.exist');
    });

    it('renames and deletes a site tag from the table', () => {
        const tagManager = visitTagManager();

        tagManager.search(commonTag).openRename(commonTag).fillRenameDialog(bulkRenamedTag).confirmRename();

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

    it('opens the side panel below the header and closes it on click-away', () => {
        const tagManager = visitTagManager();

        tagManager.search(commonTag).openUsages(commonTag);
        tagManager.getDrawer().should('be.visible');
        cy.get('[data-cm-role="tag-manager-drawer-layer"]').click('topLeft');
        tagManager.getDrawer().should('not.exist');
    });
});
