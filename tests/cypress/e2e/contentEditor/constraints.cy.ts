import {ContentEditor, JContent} from '../../page-object';
import {addNode} from '@jahia/cypress';
import {MultipleLeftRightField} from '../../page-object/fields/multipleLeftRightField';

describe('constraints', () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        addNode({
            name: 'list',
            parentPathOrId: '/sites/jcontentSite/home',
            primaryNodeType: 'jnt:contentList'
        });
        addNode({
            name: 'folder1',
            parentPathOrId: '/sites/jcontentSite/contents',
            primaryNodeType: 'jnt:contentFolder',
            children: [{name: 'subfolder1', primaryNodeType: 'jnt:contentFolder'}]
        });
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('can set restrictions on content list', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToStructuredView();
        const contentEditor = jcontent.editComponentByText('list');
        contentEditor.closeSection('Content');
        contentEditor.toggleOption('jmix:contributeMode', 'Content type restrictions');
        contentEditor.getField(MultipleLeftRightField, 'jmix:contributeMode_j:contributeTypes', true)
            .addNewValue('Banner')
            .addNewValue('Breadcrumb');
        contentEditor.save();
    });

    it('can set restrictions on content folder', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'content-folders/contents')
            .switchToListMode();
        const contentEditor = jcontent.editComponentByText('folder1');
        contentEditor.closeSection('Content');
        contentEditor.toggleOption('jmix:contributeMode', 'Content type restrictions');
        contentEditor
            .getField(MultipleLeftRightField, 'jmix:contributeMode_j:contributeTypes', true)
            .addNewValue('Banner');
        contentEditor.save();
    });

    it('can create restricted content', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'content-folders/contents/folder1')
        // verify create highlight button is present and create content
        cy.get('[data-registry-key="action:createContent"][data-sel-role="jnt:banner"]').click();
        new ContentEditor().create();

        // verify content created
        jcontent.getTable().getRowByLabel('banner').should('be.visible');
    });

    it('can inherit restricted content to subfolders', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'content-folders/contents/folder1/subfolder1')
        // verify create highlight button is present and create content
        cy.get('[data-registry-key="action:createContent"][data-sel-role="jnt:banner"]').click();
        new ContentEditor().create();

        // verify content created
        jcontent.getTable().getRowByLabel('banner').should('be.visible');
    });

    it('can add to current restrictions', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'content-folders/contents')
            .switchToListMode();
        const contentEditor = jcontent.editComponentByText('folder1');
        contentEditor.closeSection('Content');
        contentEditor
            .getField(MultipleLeftRightField, 'jmix:contributeMode_j:contributeTypes', true)
            .addNewValue('Simple text');
        contentEditor.save();
    });

    it('can create restricted content', () => {
        jcontent = JContent
            .visit('jcontentSite', 'en', 'content-folders/contents/folder1')
        // verify create highlight button is still present 
        cy.get('[data-registry-key="action:createContent"][data-sel-role="jnt:banner"]').should('be.visible');
        // verify new text restriction is present and create content
        cy.get('[data-registry-key="action:createContent"][data-sel-role="jnt:text"]').click();
        new ContentEditor().create();

        // verify content created
        jcontent.getTable().getRowByLabel('simple-text').should('be.visible');
    });

});

