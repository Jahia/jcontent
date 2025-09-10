import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite, addNode} from '@jahia/cypress';

describe('Create content tests', () => {
    const siteKey = 'jcontentSite2';
    const parentNodeName = 'landing';
    const parentNodePath = `/sites/${siteKey}/home/${parentNodeName}`;
    const testNodeName = 'rich-text';
    const testNodeText = 'Test node text to be updated';
    const createdText = 'Just created content';
    const updatedText = 'Just updated content';
    const insertedText = 'Just inserted content';
    const contentIFrame = '[data-sel-role="page-builder-frame-active"]';
    const contentEditor = '[aria-labelledby="dialog-content-editor"]';
    const visible = true;
    const absent = false;

    before(function () {
        deleteSite(siteKey);
        createSite(siteKey);

        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });

        // Add test node to be updated during the test.
        // Added to decouple test scenarios as much as possible and avoid dependencies.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: parentNodeName,
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:isAreaList'],
            children: [{
                name: testNodeName,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: testNodeText, language: 'en'}]
            }]
        });

        cy.loginAndStoreSession(); // Edit in chief
    });

    after(() => {
        //deleteSite(siteKey);
    });

    /**
     * Validates the presence or absence of content in the iframe.
     * @param value Content text to be validated
     * @param exists Whether the content is expected to be present or absent
     */
    const validateContentPresence = (value: string, exists: boolean) => {
        // Make sure Content Editor window is closed
        cy.get(contentEditor, {timeout: 90000}).should('not.exist');

        // Scroll iframe to top to avoid content being outside of the viewport
        cy.enter(contentIFrame, {timeout: 20000}).then(getBody => {
            getBody().find('p').first().then(el => el.closest('html')[0].scroll(0, -2000));
        });

        // Validate content presence or absence
        cy.iframe(contentIFrame).find('p').should(exists ? 'contain.text' : 'not.contain.text', value);
    };

    describe('Content Folders Operations', () => {
        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        it('Can create content in content folders', function () {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.selectAccordion('content-folders');
            jcontent.createContent('jnt:bigText').create();
        });
    });

    describe('Page Builder Operations', () => {
        let jcontent: JContentPageBuilder;

        beforeEach(() => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        });

        it('Create content in page builder', () => {
            const buttons = jcontent.getModule(parentNodePath).getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.getButton('New content').click();

            const contentEditor = jcontent.getCreateContent().getContentTypeSelector().searchForContentType('jnt:bigText').selectContentType('jnt:bigText').create();
            contentEditor.getRichTextField('jnt:bigText_text').type(createdText);
            contentEditor.create();

            validateContentPresence(createdText, visible);
        });

        it('Update existing content', () => {
            jcontent.getModule(parentNodePath).get().scrollIntoView();
            jcontent.getModule(`${parentNodePath}/${testNodeName}`, false).doubleClick();

            const contentEditor = new ContentEditor();
            contentEditor.getRichTextField('jnt:bigText_text').clear().type(updatedText);
            contentEditor.save();

            validateContentPresence(testNodeText, absent);
            validateContentPresence(updatedText, visible);
        });

        it('Create content in page builder using insertion points', () => {
            // Find a desired module, instantiate its object, get its header and click on it to get insertion buttons to appear
            const module = jcontent.getModule(parentNodePath, false);
            module.getHeader(false).get().click();

            // Look for insertion buttons and click on the one
            module.getCreateButtons().getInsertionButtonByIndex(1).click();

            // Create content using the create content wizard
            const contentEditor = jcontent.getCreateContent().getContentTypeSelector().searchForContentType('jnt:bigText').selectContentType('jnt:bigText').create();
            contentEditor.getRichTextField('jnt:bigText_text').type(insertedText);
            contentEditor.create();

            validateContentPresence(insertedText, visible);
        });
    });
});
