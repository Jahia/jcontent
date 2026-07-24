import {JContent} from '../../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';

describe('Create content tests', () => {
    let jcontent: JContent;
    const siteKey = 'breadcrumbsInCESite';

    before(() => {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'breadcrumbFolder',
            primaryNodeType: 'jnt:contentFolder',
            children: [{
                name: 'mylist',
                primaryNodeType: 'jnt:contentList',
                children: [{name: 'atext', primaryNodeType: 'jnt:text'}]
            }]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'area-main',
            primaryNodeType: 'jnt:contentList',
            children: [{
                name: 'test-content1',
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', language: 'en', value: 'test 1'}]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Checks breadcrumbs inside CE on a content list', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/breadcrumbFolder/mylist');
        jcontent.switchToListMode();
        const contentEditor = jcontent.editComponentByRowName('atext');
        contentEditor.switchToAdvancedMode();

        contentEditor.getBreadcrumb('mylist').should('be.visible');
        contentEditor.getBreadcrumb('breadcrumbFolder').should('be.visible').click();
        cy.get('h1').contains('breadcrumbFolder');
    });

    it('Checks breadcrumbs inside CE of a page', () => {
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        cy.get('h1').contains('Home');
        cy.get('.moonstone-loader').should('not.exist');
        jcontent.switchToListMode();
        const contentEditor = jcontent.editComponentByRowName('test-content1');
        contentEditor.switchToAdvancedMode();

        contentEditor.getBreadcrumb('Home').should('be.visible');
        contentEditor.getBreadcrumb('area-main').should('be.visible').click();
        cy.get('h1').contains('area-main');
    });
});
