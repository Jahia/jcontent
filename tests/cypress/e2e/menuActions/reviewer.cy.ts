import {JContent} from '../../page-object';
import {addNode, enableModule} from '@jahia/cypress';

describe('Reviewer permissions', () => {
    let jcontent: JContent;

    before(() => {
        enableModule('qa-module', 'digitall');
        addNode({
            name: 'my-list',
            parentPathOrId: '/sites/digitall/contents',
            primaryNodeType: 'jnt:contentList'
        });
        addNode({
            name: 'constraintlist3',
            parentPathOrId: '/sites/digitall/contents',
            primaryNodeType: 'qant:constraintList3'
        });
    });

    after(() => {
        cy.logout();
    });

    it('It verifies that reviewer cannot see creation actions', () => {
        cy.logout();
        cy.login('irina', 'password');
        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');

        // Check new content folder action is not displayed
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContentFolder"]').should('not.exist');
        cy.get('div[role="toolbar"]').find('button[data-sel-role="createContent"]').should('not.exist');

        // Check action 'new content' under my-list is not displayed
        const contextMenu = jcontent.openContextMenuByRowName('my-list');
        contextMenu.shouldNotHaveItem('New content');

        // Close contextual menu
        cy.get('.moonstone-menu_overlay').click({force: true});

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
    });
});
