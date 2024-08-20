import {PageComposer} from '../../page-object/pageComposer';
import {addNode, deleteNode, enableModule, disableModule} from '@jahia/cypress';
import { ContentEditor } from '../../page-object';

describe('Preview tests', () => {
    const siteKey = 'digitall';
    let pageComposer: PageComposer;

    before(() => {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        enableModule('jcontent-test-module', 'digitall');
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
        disableModule('jcontent-test-module', siteKey);
    });

    it('It shows correctly preview of edited page even if not the one currently rendered in PageComposer', () => {
        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
        const contentEditor = pageComposer.editPage('Our Companies');
        contentEditor.switchToAdvancedMode();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(5000);
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
        pageComposer.editComponentByText('previewWrapper')
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
            properties: [{language: 'en', name: 'text', type: 'STRING', value: 'This is a simple text'}]
        });

        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(siteKey, 'en', 'home.html');
        pageComposer.navigateToPage('chocolate,-sweets,-cakes');
        const contentEditor = pageComposer.editComponentByText('This is a simple text');

        contentEditor.switchToAdvancedMode();

        contentEditor.validateContentIsVisibleInPreview('This is a simple text');
    });
});
