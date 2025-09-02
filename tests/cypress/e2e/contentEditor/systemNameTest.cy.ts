import {JContent, PageComposer} from '../../page-object';
import {addNode, Button, enableModule, getComponentByRole, getNodeByPath} from '@jahia/cypress';

describe('System name test', () => {
    const site = 'contentEditorSite';
    let pageComposer: PageComposer;
    let jcontent: JContent;

    before(function () {
        cy.loginAndStoreSession();
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: site});
        enableModule('qa-module', site);
        addNode({
            parentPathOrId: '/sites/contentEditorSite/contents',
            name: 'simple-text',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: '/sites/contentEditorSite/contents',
            name: 'my-text-a',
            primaryNodeType: 'jnt:text'
        });
        addNode({
            parentPathOrId: '/sites/contentEditorSite/contents',
            name: 'my-text-b',
            primaryNodeType: 'jnt:text'
        });
    });

    after(function () {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: site});
        cy.logout();
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
    });

    it('Cannot save with invalid system name', function () {
        const check = function () {
            cy.get('p').contains('Your content couldn’t be saved');
            getComponentByRole(Button, 'content-type-dialog-cancel').click();
            cy.get('p').contains('System name cannot consist of');
            getComponentByRole(Button, 'backButton').click();
            getComponentByRole(Button, 'close-dialog-discard').click();
        };

        pageComposer.createPage('list\'asasa\'an@##$%#$%@#%', true);
        check();
    });

    it('Create a page with chinese characters', function () {
        const check = function () {
            pageComposer.refresh();
            cy.url({decode: true}).should('contain', '这是一个测验');
        };

        pageComposer.createPage('这是一个测验', true);
        check();
    });

    it('Create a page with a reserved word', function () {
        const check = function () {
            pageComposer.refresh();
            cy.url({decode: true}).should('contain', '/home/sites');
        };

        pageComposer.createPage('sites', false);
        check();
    });

    it('Create a page with an accented characters', function () {
        const check = function () {
            pageComposer.refresh();
            cy.url({decode: true}).should('contain', 'eaoaeuéàöäèü');
        };

        pageComposer.createPage('éàöäèü', true);
        check();
    });

    it('Create a page with special characters', function () {
        const check = function () {
            cy.get('p').contains('Your content couldn’t be saved');
            getComponentByRole(Button, 'content-type-dialog-cancel').click();
            cy.get('p').contains('System name cannot consist of');
            getComponentByRole(Button, 'backButton').click();
            getComponentByRole(Button, 'close-dialog-discard').click();
        };

        pageComposer.createPage('[]*|/%', true);
        check();
    });

    it('Create a page with ".."', function () {
        const check = function () {
            pageComposer.refresh();
            cy.url({decode: true}).should('contain', '.-');
        };

        pageComposer.createPage('..', true);
        check();
    });

    it('Check system name sync', function () {
        pageComposer.checkSystemNameSync('-', '');
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
        pageComposer.checkSystemNameSync('-1-1-', '1-1');
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
        pageComposer.checkSystemNameSync('éàöäèü', 'eaoaeu');
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
        pageComposer.checkSystemNameSync('[]-{}-()-!!', '');
        pageComposer = PageComposer.visit(site, 'en', 'home.html');
        pageComposer.checkSystemNameSync('test\'fb1’fb2', 'test-fb1-fb2');
    });

    it('Should limit the system name of content to 128 characters', function () {
        const pageName = 'abcdefg'.repeat(20);
        pageComposer.createPage(pageName, true);
        cy.waitUntil(() => getNodeByPath(`/sites/contentEditorSite/home/${pageName.substring(0, 128)}`).then(({data}) => {
            return Boolean(data?.jcr?.nodeByPath);
        }), {
            errorMsg: `Cannot find node ${pageName.substring(0, 128)} in 10s`,
            timeout: 10000,
            interval: 500
        });
    });

    it('Checks synchronization of next available systemname', function () {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');

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
        contentEditor.openSection('options').get().find('input[name="nt:base_ce:systemName"]');
        contentEditor.checkSystemName('simple-text-2');
        contentEditor.cancel();

        // Create simple text Test 4
        jcontent.createContent('jnt:text');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Test 4');
        contentEditor.openSection('options').get().find('input[name="nt:base_ce:systemName"]').clear().type('simple-text-1');
        contentEditor.create();

        // Check systemname is incremented
        jcontent.editComponentByText('Test 4');
        contentEditor.openSection('options').get().find('input[name="nt:base_ce:systemName"]');
        contentEditor.checkSystemName('simple-text-3');
        contentEditor.cancel();
    });

    it('Checks default synchronization of systemname with copy title button', function () {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');

        // Create a news
        const contentEditor = jcontent.createContent('jnt:news');
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue('News Title');
        contentEditor.getSmallTextField('nt:base_ce:systemName').addNewValue('News system name');
        contentEditor.create();

        // Edit the news and use copy title button
        jcontent.editComponentByText('News Title');
        contentEditor.switchToAdvancedMode();
        getComponentByRole(Button, 'syncSystemName').click();
        contentEditor.checkSystemName('news-title');

        // Check copy title button is now disabled
        getComponentByRole(Button, 'syncSystemName').should('be.visible').should('be.disabled');
        // Edit title into "edited-title"
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue('edited-title');
        // Check copy title is enabled
        getComponentByRole(Button, 'syncSystemName').should('be.visible').should('be.enabled');
        contentEditor.cancelAndDiscard();
    });

    it('Checks default synchronization of systemname when we have a default value', function () {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');

        // Create a news
        const contentEditor = jcontent.createContent('qant:titleWithDefaultValue');
        // Check default system name
        contentEditor.checkSystemName('value-1');
        // Set a new title
        contentEditor.getSmallTextField('qant:titleWithDefaultValue_jcr:title').addNewValue('my new value 2');
        // Check system name is updated
        contentEditor.checkSystemName('my-new-value-2');
        contentEditor.cancelAndDiscard();
    });

    it('Should display an error message if system name already exists', function () {
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');

        // Try to rename a simple text with a system name that is already used
        const contentEditor = jcontent.editComponentByText('my-text-a');
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('options').get().find('input[name="nt:base_ce:systemName"]');
        contentEditor.getSmallTextField('nt:base_ce:systemName').addNewValue('my-text-b');
        getComponentByRole(Button, 'submitSave').click();
        // Check an error message is displayed
        contentEditor.assertValidationErrorsExists();
    });
});
