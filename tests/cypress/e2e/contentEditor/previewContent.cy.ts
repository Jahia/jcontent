import {PageComposer} from '../../page-object/pageComposer';
import {addNode, deleteNode, enableModule, disableModule} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';
import {v4 as uuidv4} from 'uuid';

describe('Preview tests', () => {
    const siteKey = 'digitall';
    let pageComposer: PageComposer;
    const simpleText = 'Simple Text ' + uuidv4();
    const updatedText = 'Updated Text ' + uuidv4();

    before(() => {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'chocolate,-sweets,-cakes',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'chocolate,-sweets,-cakes', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList'
            }]
        });
    });

    after(() => {
        deleteNode(`/sites/${siteKey}/home/chocolate,-sweets,-cakes`);
        deleteNode(`/sites/${siteKey}/contents/simpleText`);
        disableModule('jcontent-test-module', siteKey);
    });

    it('It shows correctly preview of edited page even if not the one currently rendered in PageComposer', () => {
        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
        const contentEditor = pageComposer.editPage('Our Companies');
        contentEditor.switchToAdvancedMode();
        contentEditor.validateContentIsVisibleInPreview('Making a Difference');
    });

    it('renders template:include properly', () => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/home/chocolate,-sweets,-cakes/area-main`,
            name: 'previewWrapperIncludesTest',
            primaryNodeType: 'cent:previewWrapper'
        });

        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
        pageComposer.navigateToPage('chocolate,-sweets,-cakes');
        pageComposer.editComponentByText('previewWrapper');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.validateContentIsVisibleInPreview('previewWrapper Test');
        contentEditor.validateContentIsNotVisibleInPreview('H2');
    });

    it('It shows correctly preview of edited page even if the parent node name have special character', () => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/home/chocolate,-sweets,-cakes/area-main`,
            name: 'text',
            primaryNodeType: 'jnt:text',
            properties: [{language: 'en', name: 'text', type: 'STRING', value: simpleText}]
        });

        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
        pageComposer.navigateToPage('chocolate,-sweets,-cakes');
        const contentEditor = pageComposer.editComponentByText(simpleText);

        contentEditor.switchToAdvancedMode();

        contentEditor.validateContentIsVisibleInPreview(simpleText);
    });

    it('It updates preview after save', () => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'simpleText',
            primaryNodeType: 'jnt:text'
        });

        cy.loginAndStoreSession();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/simpleText');
        const contentEditor = jcontent.editContent();
        contentEditor.switchToAdvancedMode();

        cy.log('Check preview badge is not displayed');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('not.exist');

        cy.log('Update content');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue(updatedText);

        cy.log('Check preview badge is displayed');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('exist');

        contentEditor.save();

        cy.log('Check preview badge is not displayed after save');
        cy.contains('span', 'Preview will update on save', {timeout: 5000}).should('not.exist');
        contentEditor.validateContentIsVisibleInPreview(updatedText);
    });
});
