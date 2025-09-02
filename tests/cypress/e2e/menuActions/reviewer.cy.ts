import {JContent} from '../../page-object';
import {addNode, createSite, createUser, deleteSite, enableModule, grantRoles} from '@jahia/cypress';

describe('Reviewer permissions', () => {
    let jcontent: JContent;
    const SiteKey = 'PermissionsTestSite';
    const reviewerLogin = {username: 'siteReviewer', password: 'password'};

    before('Test setup', () => {
        createSite(SiteKey);
        enableModule('qa-module', SiteKey);
        createUser(reviewerLogin.username, reviewerLogin.password);
        grantRoles(`/sites/${SiteKey}`, ['reviewer'], reviewerLogin.username, 'USER');
        addNode({
            name: 'my-list',
            parentPathOrId: '/sites/PermissionsTestSite/contents',
            primaryNodeType: 'jnt:contentList'
        });
        addNode({
            name: 'constraintlist3',
            parentPathOrId: '/sites/PermissionsTestSite/contents',
            primaryNodeType: 'qant:constraintList3'
        });
    });

    after('Test cleanup', () => {
        cy.logout();
        deleteSite(SiteKey);
    });

    it('It verifies that reviewer cannot see creation actions', () => {
        cy.logout();
        cy.login('siteReviewer', 'password');
        jcontent = JContent.visit(SiteKey, 'en', 'content-folders/contents');

        // Check new content folder action is not displayed
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContentFolder"]').should('not.exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContent"]').should('not.exist');

        // Check action 'new content' under my-list is not displayed
        const contextMenu = jcontent.openContextMenuByRowName('my-list');
        contextMenu.shouldNotHaveItem('New content');
        contextMenu.close();

        // Check actions new constraintChild1... under constraintlist3 are not displayed
        const expectedConstraints = [
            'New constraintChild1',
            'New constraintChild2',
            'New constraintChild3'
        ];
        jcontent.openContextMenuByRowName('constraintlist3');
        expectedConstraints.forEach(constraintType => {
            contextMenu.shouldNotHaveItem(constraintType);
        });
        contextMenu.close();
    });
});
