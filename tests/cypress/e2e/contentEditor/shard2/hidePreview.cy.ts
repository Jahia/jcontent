import {addNode, createSite, deleteSite, getNodeByPath} from '@jahia/cypress';
import {CategoryManager, JContent, SidePanel} from '../../../page-object';

describe('Hide Preview testsuite', () => {
    const siteKey = 'hidePreviewSite';
    const sidePanel = new SidePanel().inCE();

    before('Create site and content', () => {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'ContentFolder',
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'Text',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', language: 'en', value: 'Text content'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/files`,
            name: 'Folder',
            primaryNodeType: 'jnt:folder'
        });
    });

    beforeEach('login and visit home', () => {
        cy.login();
    });

    it('Preview shouldn\'t exist for a site', () => {
        JContent.visit(siteKey, 'en', 'home.html');
        getNodeByPath(`/sites/${siteKey}`).then(res => {
            cy.visit(`/jahia/administration/digitall/settings/properties#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${siteKey},uilang:en,uuid:'${res.data.jcr.nodeByPath.uuid}')))`);
        });
        sidePanel.getByRole('tab-preview').should('not.exist');
    });

    it('Preview shouldn\'t exist for a content folder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'home.html');
        jcontent.getAccordionItem('content-folders').click();
        const ce = jcontent.editComponentByText('ContentFolder');
        ce.switchToAdvancedMode();
        sidePanel.getByRole('tab-preview').should('not.exist');
    });

    it('Preview should be visible for a content', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/Text');
        const ce = jcontent.editContent();
        ce.switchToAdvancedMode();
        sidePanel.switchToPreviewTab();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
    });

    it('Preview shouldn\'t be shown in Category Manager', () => {
        const cm = CategoryManager.visitCategoryManager('en');
        const ce = cm.editItem('Annual Filings');
        ce.switchToAdvancedMode();
        sidePanel.getByRole('tab-preview').should('not.exist');
    });

    afterEach('logout', () => {
        cy.logout();
    });

    after('Delete site and content', () => {
        deleteSite(siteKey);
    });
});
