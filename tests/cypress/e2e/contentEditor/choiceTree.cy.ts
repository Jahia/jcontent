import {addNode, createSite, deleteNode, deleteSite, enableModule, getNodeByPath} from '@jahia/cypress';
import {JContent} from '../../page-object';

const siteKey = 'choiceTreeSelectorSite';

let jcontent: JContent;
let choicetreeContent2Uuid: string;
let choicetreeContent11Uuid: string;

describe('Test Choicetree selector type', () => {
    before('Prepare test env', () => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        deleteNode('/sites/systemsite/categories/choiceTreeCategoryRoot');
        // Create site
        createSite(siteKey, {templateSet: 'qa-simpleTemplateSet', serverName: 'localhost', locale: 'en'});
        // Enable test module on site
        enableModule('jcontent-test-module', siteKey);
        // Create tree category in system site
        addNode({
            parentPathOrId: '/sites/systemsite/categories',
            name: 'choiceTreeCategoryRoot',
            primaryNodeType: 'jnt:category'
        });
        addNode({
            parentPathOrId: '/sites/systemsite/categories/choiceTreeCategoryRoot',
            name: 'choiceTreeCategory1',
            primaryNodeType: 'jnt:category'
        });
        addNode({
            parentPathOrId: '/sites/systemsite/categories/choiceTreeCategoryRoot',
            name: 'choiceTreeCategory2',
            primaryNodeType: 'jnt:category'
        });
        // Create tree content
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'choiceTreeContentRoot',
            primaryNodeType: 'cent:testChoiceTreeContentRoot'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/choiceTreeContentRoot`,
            name: 'choiceTreeContent1',
            primaryNodeType: 'cent:testChoiceTreeContent'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/choiceTreeContentRoot/choiceTreeContent1`,
            name: 'choiceTreeContent1-1',
            primaryNodeType: 'cent:testChoiceTreeContent'
        }).then(data => {
            choicetreeContent11Uuid = data.data.jcr.addNode.uuid;
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/choiceTreeContentRoot/choiceTreeContent1`,
            name: 'choiceTreeContent1-2',
            primaryNodeType: 'cent:testChoiceTreeContent'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents/choiceTreeContentRoot`,
            name: 'choiceTreeContent2',
            primaryNodeType: 'cent:testChoiceTreeContent'
        }).then(data => {
            choicetreeContent2Uuid = data.data.jcr.addNode.uuid;
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/choiceTreeContentRoot`,
            name: 'choiceTreeContent3',
            primaryNodeType: 'cent:testChoiceTreeContent'
        });
    });

    beforeEach('', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('can handle choice tree selector with a custom root path', () => {
        // Create content
        const contentEditor = jcontent.createContent('testChoiceTree');
        const choiceTreeField = contentEditor.getChoiceTreeField('cent:testChoiceTree_multipleChoiceTree');
        const choiceTree = choiceTreeField.openTree();
        // Show 2 roots entries
        choiceTree.getEntries().should('have.length', 2);
        choiceTree.selectEntry('choiceTreeContent2');
        choiceTree.openEntry('choiceTreeContent1');
        choiceTree.selectEntry('choiceTreeContent1-1');
        choiceTreeField.getValues().should('have.length', 2);
        choiceTreeField.getValues().should('contain', 'choiceTreeContent2');
        choiceTreeField.getValues().should('contain', 'choiceTreeContent1-1');
        choiceTreeField.closeTree();
        contentEditor.create();
        // Validate saved content
        getNodeByPath(`/sites/${siteKey}/contents/testchoicetree`, ['multipleChoiceTree']).then(res => {
            const savedValues = res.data.jcr.nodeByPath.properties[0].values;
            expect(savedValues).to.length(2);
            expect(savedValues).to.include(choicetreeContent2Uuid);
            expect(savedValues).to.include(choicetreeContent11Uuid);
        });
        // Edit content
        const editContentEditorEdit = jcontent.editComponentByText('testchoicetree');
        const editChoiceTreeField = editContentEditorEdit.getChoiceTreeField('cent:testChoiceTree_multipleChoiceTree');
        editChoiceTreeField.getValues().should('have.length', 2);
        editChoiceTreeField.getValues().should('contain', 'choiceTreeContent2');
        editChoiceTreeField.getValues().should('contain', 'choiceTreeContent1-1');
        editChoiceTreeField.removeValue('choiceTreeContent2');
        editChoiceTreeField.getValues().should('have.length', 1);
        editChoiceTreeField.getValues().should('contain', 'choiceTreeContent1-1');
        contentEditor.save();
        // Validate saved content
        getNodeByPath(`/sites/${siteKey}/contents/testchoicetree`, ['multipleChoiceTree']).then(res => {
            const savedValues = res.data.jcr.nodeByPath.properties[0].values;
            expect(savedValues).to.length(1);
            expect(savedValues).to.include(choicetreeContent11Uuid);
        });
    });
    it('can handle choice tree selector for multiple types', () => {
        // Check tree is opened at category root, open it to see other types
        const contentEditor = jcontent.createContent('testChoiceTree');
        const choiceTreeField = contentEditor.getChoiceTreeField('cent:testChoiceTree_multipleChoiceTreeWithTypes');
        const choiceTree = choiceTreeField.openTree();
        // Show 2 roots entries
        choiceTree.getEntries().should('have.length', 1);
        choiceTree.getEntries().should('contain', 'choiceTreeContentRoot');
        choiceTree.openEntry('choiceTreeContentRoot');
        choiceTree.getEntries().should('have.length', 3); // 3 = root + 2 children
        choiceTree.getEntries().should('contain', 'choiceTreeContent1');
        choiceTree.getEntries().should('contain', 'choiceTreeContent2');
    });

    it('does not display the Choice tree selector for single value', () => {
        const contentEditor = jcontent.createContent('testChoiceTree');
        contentEditor.openSection('Content');
        const displayedChoiceTreeField = contentEditor.getChoiceTreeField('cent:testChoiceTree_multipleChoiceTreeWithTypes');
        displayedChoiceTreeField.getChoiceTreeInput().should('exist');
        const choiceTreeField = contentEditor.getChoiceTreeField('cent:testChoiceTree_singleChoiceTree');
        choiceTreeField.getChoiceTreeInput().should('not.exist');
    });

    it('can display the category selector', () => {
        // Check tree is opened at category root, open it to see other types
        const contentEditor = jcontent.createContent('testChoiceTree');
        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:categorized', 'Categories');
        const categoryField = contentEditor.getChoiceTreeField('jmix:categorized_j:defaultCategory');
        const choiceTree = categoryField.openTree();
        // We check only categories added by this test.
        choiceTree.getEntries().should('contain', 'choiceTreeCategoryRoot');
        choiceTree.openEntry('choiceTreeCategoryRoot');
        choiceTree.getEntries().should('contain', 'choiceTreeCategory1');
        choiceTree.getEntries().should('contain', 'choiceTreeCategory1');
        // Simple check that category selector is displayed properly with expected values.
    });

    after('Clean up test env', () => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        deleteNode('/sites/systemsite/categories/choiceTreeCategoryRoot');
    });
});
