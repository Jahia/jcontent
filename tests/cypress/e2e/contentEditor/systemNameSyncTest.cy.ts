import {ContentEditor, JContent} from '../../page-object';
import {addNode, Button, createSite, deleteSite, enableModule, getComponentByRole} from '@jahia/cypress';

describe('System name sync test', () => {
    const siteKey = 'systemNameSyncSite';
    let jcontent: JContent;

    before(function () {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'simple-text',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-text-a',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-text-b',
            primaryNodeType: 'jnt:text'
        });
    });

    after(function () {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    function checkSystemName(contentEditor: ContentEditor, expectedSystemName: string) {
        contentEditor.getSmallTextField('nt:base_ce:systemName').checkValue(expectedSystemName);
    }

    it('Checks synchronization of next available systemname', function () {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        // Create simple text Test 2
        const contentEditor = jcontent.createContent('jnt:text');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Test 2');
        contentEditor.create();

        // Create simple text Test 3
        jcontent.createContent('jnt:text');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Test 3');
        contentEditor.create();

        // Check systemname is incremented
        jcontent.editComponentByText('Test 3');
        contentEditor.openSection('options');
        checkSystemName(contentEditor, 'simple-text-2');
        contentEditor.cancel();

        // Create simple text Test 4
        jcontent.createContent('jnt:text');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Test 4');
        contentEditor.openSection('options');
        contentEditor.getSmallTextField('nt:base_ce:systemName').addNewValue('simple-text-1');
        contentEditor.create();

        // Check systemname is incremented
        jcontent.editComponentByText('Test 4');
        contentEditor.openSection('options');
        checkSystemName(contentEditor, 'simple-text-3');
        contentEditor.cancel();
    });

    it('Checks default synchronization of systemname with copy title button', function () {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        // Create a news
        const contentEditor = jcontent.createContent('jnt:news');
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue('News Title');
        contentEditor.getSmallTextField('nt:base_ce:systemName').addNewValue('News system name');
        contentEditor.create();

        // Edit the news and use copy title button
        jcontent.editComponentByText('News Title');
        contentEditor.switchToAdvancedMode();
        getComponentByRole(Button, 'syncSystemName').click();
        checkSystemName(contentEditor, 'news-title');

        // Check copy title button is now disabled
        getComponentByRole(Button, 'syncSystemName').should('be.visible').should('be.disabled');
        // Edit title into "edited-title"
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue('edited-title');
        // Check copy title is enabled
        getComponentByRole(Button, 'syncSystemName').should('be.visible').should('be.enabled');
        contentEditor.cancelAndDiscard();
    });

    it('Checks default synchronization of systemname when we have a default value', function () {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        // Create a news
        const contentEditor = jcontent.createContent('qant:titleWithDefaultValue');
        // Check default system name
        checkSystemName(contentEditor, 'value-1');
        // Set a new title
        contentEditor.getSmallTextField('qant:titleWithDefaultValue_jcr:title').addNewValue('my new value 2');
        // Check system name is updated
        checkSystemName(contentEditor, 'my-new-value-2');
        contentEditor.cancelAndDiscard();
    });

    it('Should display an error message if system name already exists', function () {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

        // Try to rename a simple text with a system name that is already used
        const contentEditor = jcontent.editComponentByText('my-text-a');
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('options');
        contentEditor.getSmallTextField('nt:base_ce:systemName').addNewValue('my-text-b');
        getComponentByRole(Button, 'submitSave').click();
        // Check an error message is displayed
        contentEditor.assertValidationErrorsExists();
    });
});
