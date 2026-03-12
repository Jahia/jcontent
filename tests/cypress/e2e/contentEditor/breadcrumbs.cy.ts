import {ContentEditor, JContent} from '../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {Breadcrumb} from '../../page-object/breadcrumb';

describe('Create content tests', () => {
    let jcontent: JContent;
    const siteKey = 'breadcrumbsInCESite';

    before(() => {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'breadcrumbFolder',
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/breadcrumbFolder`,
            name: 'mylist',
            primaryNodeType: 'jnt:contentList',
            children: [
                {
                    name: 'atext',
                    primaryNodeType: 'jnt:text'
                }
            ]
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
        jcontent.editComponentByRowName('atext');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        Breadcrumb.findByContentinCE('mylist').should('exist');
        Breadcrumb.findByContentinCE('breadcrumbFolder').should('exist').click();
        cy.get('h1').contains('breadcrumbFolder');
    });

    it('Checks breadcrumbs inside CE of a page', () => {
        jcontent = JContent.visit(siteKey, 'en', 'pages/home/search-results');
        jcontent.switchToListMode();
        jcontent.editComponentByRowName('simple-search-form');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        Breadcrumb.findByContentinCE('Search Results').should('exist');
        Breadcrumb.findByContentinCE('landing').should('exist').click();
        cy.get('h1').contains('landing');
    });
});
