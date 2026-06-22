import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';

describe('Create content constraints', () => {
    const siteKey = 'constraintsSite';
    const homePath = `/sites/${siteKey}/home`;
    const twoMultiplePath = `${homePath}/area-main/test-two-multiple`;
    const twoMultipleChild1Path = `${twoMultiplePath}/childObject1-1`;
    const oneMultiplePath = `${homePath}/page-one-multiple/area-main/test-one-multiple`;
    const oneMultipleChild1Path = `${oneMultiplePath}/childObject1`;

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

        addNode({
            name: 'page-one-multiple',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'One Multiple Page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-one-multiple',
                    primaryNodeType: 'cent:twoChildObjectsOneMultiple',
                    children: [
                        {name: 'childObject1', primaryNodeType: 'cent:childObject1'},
                        {name: 'childObject2', primaryNodeType: 'cent:childObject2'}
                    ]
                }]
            }]
        });

        addNode({
            name: 'page-one-multiple-limit',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'One Multiple Limit Two Page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-one-multiple-limit',
                    primaryNodeType: 'cent:oneMultipleWithLimitTwo'
                }]
            }]
        });

        addNode({
            name: 'page-two-multiple-named',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Two Multiple One Named Page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-two-multiple-named',
                    primaryNodeType: 'cent:twoMultipleOneNamed'
                }]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('resolves create actions correctly when placeholder becomes unavailable in the view due to size restriction', () => {
        // Navigate to structured view — both named children are populated
        let jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToStructuredView();

        // Both slots are filled so neither create option should appear
        let contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');

        // Delete childObject1 to free up the slot
        deleteNode(twoMultipleChild1Path);

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
        // This step may become necessary of tests are flaky due to async data load
        // jcontent = JContent
        //     .visit(siteKey, 'en', 'pages/home')
        //     .switchToStructuredView();

        contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');
    });

    it('resolves named create actions correctly as placeholders become available/unavailable when children are added/removed', () => {
        // Both named children (childObject1, childObject2) are populated
        let jcontent = JContent
            .visit(siteKey, 'en', 'pages/home/page-one-multiple')
            .switchToStructuredView();

        // Only wildcard child (childObject3) should be available
        let contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldNotHaveItem('New childObject2');
        contextMenu.shouldHaveItem('New childObject3');

        // Delete childObject1 to free up the named slot
        deleteNode(oneMultipleChild1Path);

        // Revisit to refresh state
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home/page-one-multiple')
            .switchToStructuredView();

        // Now childObject1 should appear alongside the always-available childObject3
        contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');
        contextMenu.shouldNotHaveItem('New childObject2');
        contextMenu.shouldHaveItem('New childObject3');

        // Create childObject1 via the context menu
        contextMenu.select('New childObject1');
        const contentEditor = new ContentEditor();
        contentEditor.create();

        // Revisit and verify childObject1 is gone again, only childObject3 remains
        // This step may become necessary of tests are flaky due to async data load
        // jcontent = JContent
        //     .visit(siteKey, 'en', 'pages/home/page-one-multiple')
        //     .switchToStructuredView();

        contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
        contextMenu.shouldNotHaveItem('New childObject2');
        contextMenu.shouldHaveItem('New childObject3');
    });

    it('resolves create actions correctly with one named and one wildcard placeholder', () => {
        const jcontent = JContent
            .visit(siteKey, 'en', 'pages/home/page-two-multiple-named')
            .switchToStructuredView();

        // Both wildcard children should be available
        let contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple-named').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');

        // Create childObject1
        contextMenu.select('New childObject1');
        let contentEditor = new ContentEditor();
        contentEditor.create();

        // Verify both are still available
        contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple-named').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');

        // Create childObject2
        contextMenu.select('New childObject2');
        contentEditor = new ContentEditor();
        contentEditor.create();

        // Verify both are still available
        contextMenu = jcontent.getTable().getRowByLabel('test-two-multiple-named').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');
        contextMenu.shouldHaveItem('New childObject2');
    });

    it('resolves create actions correctly for single wildcard type that can be created multiple times with a limit', () => {
        const jcontent = JContent
            .visit(siteKey, 'en', 'pages/home/page-one-multiple-limit')
            .switchToStructuredView();

        // The single wildcard child type should be available
        let contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple-limit').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');

        // Create childObject1
        contextMenu.select('New childObject1');
        let contentEditor = new ContentEditor();
        contentEditor.create();

        // Verify it is still available after creation (wildcard allows multiple)
        contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple-limit').contextMenu();
        contextMenu.shouldHaveItem('New childObject1');

        // Create another childObject1
        contextMenu.select('New childObject1');
        contentEditor = new ContentEditor();
        contentEditor.create();

        // Verify it is still available
        contextMenu = jcontent.getTable().getRowByLabel('test-one-multiple-limit').contextMenu();
        contextMenu.shouldNotHaveItem('New childObject1');
    });
});
