import {addNode, createSite, deleteSite, getNodeByPath} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {RepositoryExplorer} from '../../page-object/repositoryExplorer';
import {CategoryManager} from '../../page-object';

const siteKey = 'hidePreviewSite';

const initVisit = () => {
    const jcontent = JContent.visit(siteKey, 'en', 'home.html');
    jcontent.switchToPageBuilder();
    return jcontent;
};

describe('Hide Preview testsuite', () => {
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
            primaryNodeType: 'jnt:bigText'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/files`,
            name: 'Folder',
            primaryNodeType: 'jnt:folder'
        });
    });

    beforeEach('login and visit home', () => {
        cy.login();
        initVisit();
    });

    it('Preview shouldn\'t exist for a site', () => {
        getNodeByPath(`/sites/${siteKey}`).then(res => {
            cy.visit(`/jahia/administration/digitall/settings/properties#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${siteKey},uilang:en,uuid:'${res.data.jcr.nodeByPath.uuid}')))`);
        });
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
    });

    it('Preview shouldn\'t exist for a content folder', () => {
        const jcontent = initVisit();
        jcontent.getAccordionItem('content-folders').click();
        const ce = jcontent.editComponentByText('ContentFolder');
        ce.switchToAdvancedMode();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
    });

    it('Preview should be visible for a content', () => {
        const jcontent = initVisit();
        jcontent.getAccordionItem('content-folders').click();
        const ce = jcontent.editComponentByText('Text');
        ce.switchToAdvancedMode();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('be.visible');
    });

    it('Preview shouldn\'t exist for administrators in Repository Explorer', () => {
        const re = RepositoryExplorer.open();
        re.openSection('root');
        re.openSection('groups');
        const ce = re.editItem('administrators');
        ce.switchToAdvancedMode();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
    });

    it('Preview shouldn\'t be shown in Category Manager', () => {
        const cm = CategoryManager.visitCategoryManager('en');
        const ce = cm.editItem('Annual Filings');
        ce.switchToAdvancedMode();
        cy.get('iframe[data-sel-role="edit-preview-frame"]').should('not.exist');
    });

    afterEach('logout', () => {
        cy.logout();
    });

    after('Delete site and content', () => {
        deleteSite(siteKey);
    });
});
