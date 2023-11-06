import {addNode, createSite, createUser, deleteSite, deleteUser, getComponent, grantRoles} from '@jahia/cypress';
import {CreateContent, JContent} from '../../page-object';
import {DeleteDialog} from '../../page-object/deleteDialog';

describe('Test the save publish buttons flow', () => {
    const siteKey = 'savePublishButtonsFlow';
    const sitePath = '/sites/' + siteKey;
    const siteContentPath = sitePath + '/contents';
    const contentFolder = 'contentEditorTestContents';
    const contentTest = 'contentEditorAllFieldsSimple';
    const userName = 'editorInChief';
    const langEN = 'en';
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN
    };

    before(function () {
        createUser(userName, 'password', [{name: 'preferredLanguage', value: langEN}]);
        createSite(siteKey, siteConfig);
        grantRoles('/sites/' + siteKey, ['editor-in-chief'], userName, 'USER');
        addNode({
            parentPathOrId: siteContentPath,
            name: contentFolder,
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: siteContentPath + '/' + contentFolder,
            name: contentTest,
            primaryNodeType: 'qant:allFields',
            properties: [
                {name: 'sharedSmallText', value: 'Initial text', language: langEN},
                {name: 'sharedTextarea', value: 'Initial text in textarea', language: langEN}
            ]
        });
    });

    after(function () {
        deleteSite(siteKey);
        deleteUser(userName);
    });

    const clickPublishNow = () => {
        cy.get('#publishNowButton').should('be.visible').find('button').contains('Publish now').click();
    };

    // Implement scenario from https://jira.jahia.org/browse/BACKLOG-21685
    it('Publish deletion in structured view', () => {
        cy.log('Login with editor in chief');
        cy.login(userName, 'password');
        const jcontent = JContent.visit(siteKey, langEN, 'pages/home');
        const module = jcontent.switchToPageBuilder().getModule(sitePath + '/home/area-main');
        module.getCreateButtons().getButton('New content').click();
        const contentEditor = new CreateContent(jcontent).getContentTypeSelector().searchForContentType('Rich text').selectContentType('Rich text').create();
        contentEditor.getRichTextField('jnt:bigText_text').type('Newly Created Content');
        contentEditor.create();
        jcontent.getHeaderActionButton('publish').should('exist').and('be.visible').click(); // Verify header is loaded first
        clickPublishNow();
        jcontent.switchToListMode().getTable().getRowByLabel('Newly Created Content').contextMenu().select('Delete');
        getComponent(DeleteDialog).markForDeletion();
        jcontent.switchToStructuredView().getTable().selectRowByLabel('Newly Created Content');
        jcontent.getHeaderActionButton('publishDeletion').click();
        clickPublishNow();
    });
});
