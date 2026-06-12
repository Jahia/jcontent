import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';

describe('Create content constraints', () => {
    const siteKey = 'constraintsSite';
    const homePath = `/sites/${siteKey}/home`;
    const modulePath = `${homePath}/area-main/test-two-multiple`;
    const child1Path = `${modulePath}/childObject1-1`;

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);

        addNode({
            name: 'area-main',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:isAreaList'],
            children: [{
                name: 'test-two-multiple',
                primaryNodeType: 'cent:twoMultipleWithLimitTwo',
                children: [
                    {name: 'childObject1-1', primaryNodeType: 'cent:childObject1'},
                    {name: 'childObject1-2', primaryNodeType: 'cent:childObject1'}
                ]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should hide filled named children and show available ones in context menu', () => {
        // Navigate to structured view — both named children are populated
        let jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToStructuredView();

        // Both slots are filled so neither create option should appear
        let contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');

        // Delete childObject1 to free up the slot
        deleteNode(child1Path);

        // Revisit to refresh state
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToStructuredView();

        // Now "New childObject1" should appear but "New childObject2" should still be absent
        contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');

        // Create childObject1 via the context menu
        contextMenu.select('New childObject1');
        const contentEditor = new ContentEditor();
        contentEditor.create();

        // Revisit and verify "New childObject1" is gone again
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToStructuredView();

        contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');
    });
});

