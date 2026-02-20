import {ContentEditor, JContent} from '../../page-object';
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
    const siteKey2 = 'publicationStatusSiteEnFr';
    const editor = {username: 'editor', password: 'password'};
    const textName = 'test-text';
    const folderName = 'test-folder';

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
        cy.executeGroovy('contentEditor/contentMultiLanguage/contentMultiLanguageSite.groovy', {SITEKEY: siteKey2});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: textName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Test 1', language: 'en'}]
        });

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: folderName,
            primaryNodeType: 'jnt:contentFolder'
        });

        addNode({
            parentPathOrId: `/sites/${siteKey2}/contents`,
            name: "multilangText",
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', value: 'Test EN', language: 'en'},
                {name: 'text', value: 'Test FR', language: 'fr'},
                {name: 'text', value: 'Test DE', language: 'de'}
            ]
        })
            .then(() => {
                return publishAndWaitJobEnding(
                    `/sites/${siteKey2}/contents/multilangText`,
                    ['en', 'fr', 'de']
                );
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
        deleteSite(siteKey2);
        cy.logout();
    });

    it('should show correct publication status for content folders', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`);
        jcontent.assertStatusType('notPublished');
        jcontent.publishAll();

        cy.log('Check content folder publication status');
        JContent.visit(siteKey, 'en', `content-folders/contents/${folderName}`).assertStatusType('published');
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

    it('checks publication status in different languages', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey2, 'en', 'content-folders/contents');

        // Verify status is published
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Published by root');

        // Edit text in EN
        jcontent.editComponentByRowName('multilangText');
        const ce = new ContentEditor();
        ce.getSmallTextField('jnt:text_text').addNewValue('Edit test EN');
        ce.save();

        // Verify status is now modified
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Modified by root');

        // Edit text in FR
        jcontent.getLanguageSwitcher().select('fr');
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Published by root');
        jcontent.editComponentByRowName('multilangText');
        ce.getSmallTextField('jnt:text_text').addNewValue('Edit test FR');
        ce.save();

        // Verify status is now modified in FR and EN
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Modified by root');
        jcontent.getLanguageSwitcher().select('en');
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Modified by root');

        // Verify status is still published in DE
        jcontent.getLanguageSwitcher().select('de');
        jcontent.getTable().getRowByName('multilangText').should('contain.text', 'Published by root');
    });
});
