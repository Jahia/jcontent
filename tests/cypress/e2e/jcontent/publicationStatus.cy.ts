import {JContent} from '../../page-object';
import {
    addNode,
    createSite,
    createUser,
    deleteSite,
    grantRoles,
    markForDeletion,
    publishAndWaitJobEnding,
    unpublishNode
} from '@jahia/cypress';

describe('Publication status badge test', () => {
    const siteKey = 'publicationStatusSite';
    const editor = {username: 'editor', password: 'password'};
    const textName = 'test-text';

    function createHomeSubpage(titleName: string) {
        return addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: titleName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: titleName, language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ]
        });
    }

    /** Check publication status of page in jcontent and content editor */
    function checkPublicationStatus(jcontent: JContent, pageTreeItem, statusType) {
        jcontent.getAccordionItem('pages').getTreeItem(pageTreeItem).click();
        jcontent.assertStatusType(statusType);

        const ce = jcontent.editPage();
        ce.assertStatusType(statusType);
        ce.cancel();
    }

    before(() => {
        createSite(siteKey, {templateSet: 'jcontent-test-template', serverName: 'localhost', locale: 'en'});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: textName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Test 1', language: 'en'}]
        });

        createHomeSubpage('publishedPage')
            .then(() => createHomeSubpage('unpublishedPage'))
            .then(() => createHomeSubpage('notPublishedPage'))
            .then(() => {
                // Publish/unpublish pages
                publishAndWaitJobEnding(`/sites/${siteKey}/home/publishedPage`, ['en']);
                publishAndWaitJobEnding(`/sites/${siteKey}/home/unpublishedPage`, ['en']);
                unpublishNode(`/sites/${siteKey}/home/unpublishedPage`, 'en');
            });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should show the last publisher, not the last editor', () => {
        cy.log('Login as editor and edit the text content');
        cy.login(editor.username, editor.password);
        let jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${textName}`);
        const ce = jcontent.editContent();
        ce.getSmallTextField('jnt:text_text').addNewValue('Test 2');
        ce.save();
        cy.logout();

        cy.log('Login as root and publish the text content');
        cy.login('root', Cypress.env('SUPER_USER_PASSWORD'));
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.publishAll();
        cy.logout();

        cy.log('Login as editor and check the publication status');
        cy.login(editor.username, editor.password);
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        // Publication status visible when hovering over publication cell in table
        jcontent.getTable().getRowByLabel('Test 2')
            .should('contain.text', 'Published by root')
            .and('not.contain.text', `Published by ${editor.username}`);
    });

    it('should show correct publication status even when marked for deletion', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/publishedPage');

        checkPublicationStatus(jcontent, 'publishedPage', 'published');
        checkPublicationStatus(jcontent, 'unpublishedPage', 'notPublished');
        checkPublicationStatus(jcontent, 'notPublishedPage', 'notPublished');

        cy.log('Mark pages for deletion');
        markForDeletion(`/sites/${siteKey}/home/publishedPage`);
        markForDeletion(`/sites/${siteKey}/home/unpublishedPage`);
        markForDeletion(`/sites/${siteKey}/home/notPublishedPage`);

        checkPublicationStatus(jcontent, 'publishedPage', 'published');
        checkPublicationStatus(jcontent, 'unpublishedPage', 'notPublished');
        checkPublicationStatus(jcontent, 'notPublishedPage', 'notPublished');
    });
});
