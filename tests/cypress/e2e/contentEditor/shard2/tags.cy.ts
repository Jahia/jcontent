import {JContent} from '../../../page-object/jcontent';
import {addNode, context, createSite, deleteSite, enableModule, uploadFile} from '@jahia/cypress';
import {TagField} from '../../../page-object/fields/tagField';
import {TagManager} from '../../../page-object';
import gql from 'graphql-tag';

describe('Tags tests in content editor', () => {
    let jcontent: JContent;
    const siteKey = 'tagsSite';
    const fileName = 'tagged-file.docx';

    const addTextForTags = (name: string, tags?: string[]) => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', language: 'en', value: name},
                ...(tags ? [{name: 'j:tagList', values: tags}] : [])
            ],
            ...(tags ? {mixins: ['jmix:tagged']} : {})
        });
    };

    const openTagField = (name: string) => {
        const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents').editComponentByRowName(name);
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('Classification and Metadata');
        return {contentEditor, tagField: contentEditor.getField(TagField, 'jmix:tagged_j:tagList')};
    };

    const openFileClassification = () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'media/files').switchToListMode().editComponentByRowName(fileName);
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('Classification and Metadata');
        return contentEditor;
    };

    before(function () {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsSimple',
            primaryNodeType: 'qant:allFields'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsMultiple',
            primaryNodeType: 'qant:allFieldsMultiple'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'myTextForTags',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'my text for tags'}]
        });
        addTextForTags('textForSavedTag');
        addTextForTags('textForRemovedTag', ['keeptag', 'removetag']);
        addTextForTags('textForTagManagerDelete', ['tm-kept-tag', 'tm-deleted-tag']);
        addTextForTags('textForContentEditorRemove', ['ce-kept-tag', 'ce-removed-tag']);
        addTextForTags('textForCancelledRemove', ['cancel-kept-tag', 'cancel-removed-tag']);
        addTextForTags('textSharingTagEdited', ['own-tag', 'shared-tag']);
        addTextForTags('textSharingTagUntouched', ['shared-tag']);
        uploadFile('/assets/uploadMedia/myfile.docx', `/sites/${siteKey}/files`, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        cy.apollo({
            mutation: gql`mutation AddTags {
            jcr {
                mutateNode(pathOrId: "/sites/tagsSite/contents/allFieldsMultiple") {
                    addMixins(mixins: ["jmix:tagged"])
                    mutateProperty(name: "j:tagList") {
                        setValues(values: ["jahia", "j@hia", "#123", "123"])
                    }
                }
            }
        }`
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should add a tag', () => {
        context.tag('tags', 'content-editor', 'save-add');
        const contentEditor = jcontent.editComponentByRowName('textForSavedTag');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.addNewValue('simpletag');

        tagField.getTags().should('have.length', 1);
        tagField.assertTagText('simpletag', 0);
        contentEditor.save();
        contentEditor.cancel();

        const {contentEditor: reopenedEditor, tagField: savedTagField} = openTagField('textForSavedTag');
        savedTagField.getTags().should('have.length', 1);
        savedTagField.assertTagText('simpletag', 0);
        reopenedEditor.cancel();
    });

    it('should remove a tag', () => {
        context.tag('tags', 'content-editor', 'save-remove');
        const {contentEditor, tagField} = openTagField('textForRemovedTag');
        tagField.removeTag('removetag');

        tagField.getTags().should('have.length', 1);
        contentEditor.save();
        contentEditor.cancel();

        const {contentEditor: reopenedEditor, tagField: savedTagField} = openTagField('textForRemovedTag');
        savedTagField.getTags().should('have.length', 1);
        savedTagField.assertTagText('keeptag', 0);
        reopenedEditor.cancel();
    });

    it('should not save a tag added to a file when the edit is cancelled', () => {
        context.tag('tags', 'content-editor', 'cancel-add', 'media');
        const contentEditor = openFileClassification();
        contentEditor.toggleOption('jmix:tagged', 'Tags');
        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.addNewValue('unsavedtag');
        contentEditor.cancelAndDiscard();

        const reopenedEditor = openFileClassification();
        reopenedEditor.getDynamicFieldset('jmix:tagged').find('input').should('not.be.checked');
        reopenedEditor.toggleOption('jmix:tagged', 'Tags');
        reopenedEditor.getField(TagField, 'jmix:tagged_j:tagList').getTags().should('have.length', 0);
        reopenedEditor.cancelAndDiscard();
    });

    it('should keep a removed tag when the edit is cancelled', () => {
        context.tag('tags', 'content-editor', 'cancel-remove');
        const {contentEditor, tagField} = openTagField('textForCancelledRemove');
        tagField.removeTag('cancel-removed-tag');
        tagField.getTags().should('have.length', 1);
        contentEditor.cancelAndDiscard();

        const {contentEditor: reopenedEditor, tagField: savedTagField} = openTagField('textForCancelledRemove');
        savedTagField.getTags().should('have.length', 2);
        savedTagField.assertTagText('cancel-kept-tag', 0);
        savedTagField.assertTagText('cancel-removed-tag', 1);
        reopenedEditor.cancel();
    });

    it('should keep a tag on other content when it is removed from one content', () => {
        context.tag('tags', 'content-editor', 'remove-other-content');
        const {contentEditor, tagField} = openTagField('textSharingTagEdited');
        tagField.removeTag('shared-tag');
        contentEditor.save();
        contentEditor.cancel();

        // Check the removal was saved before checking the other content still has the tag
        const {contentEditor: editedEditor, tagField: editedTagField} = openTagField('textSharingTagEdited');
        editedTagField.getTags().should('have.length', 1);
        editedTagField.assertTagText('own-tag', 0);
        editedEditor.cancel();

        const {contentEditor: untouchedEditor, tagField: untouchedTagField} = openTagField('textSharingTagUntouched');
        untouchedTagField.getTags().should('have.length', 1);
        untouchedTagField.assertTagText('shared-tag', 0);
        untouchedEditor.cancel();
    });

    it('should remove a tag from content editor when it is deleted in tag manager', () => {
        context.tag('tags', 'tag-manager', 'content-editor', 'delete-in-tag-manager');
        const tagManager = TagManager.visit(siteKey, 'en');
        tagManager.search('tm-deleted-tag').openDelete('tm-deleted-tag').confirmDelete();
        cy.contains('[data-cm-role="tag-manager-row"]', 'tm-deleted-tag').should('not.exist');

        const {contentEditor, tagField} = openTagField('textForTagManagerDelete');
        tagField.getTags().should('have.length', 1);
        tagField.assertTagText('tm-kept-tag', 0);
        contentEditor.cancel();
    });

    it('should remove a tag from tag manager when it is removed in content editor', () => {
        context.tag('tags', 'tag-manager', 'content-editor', 'remove-in-content-editor');
        const {contentEditor, tagField} = openTagField('textForContentEditorRemove');
        tagField.removeTag('ce-removed-tag');
        contentEditor.save();
        contentEditor.cancel();

        const tagManager = TagManager.visit(siteKey, 'en');
        tagManager.getRow('ce-kept-tag').should('contain', '1');
        cy.contains('[data-cm-role="tag-manager-row"]', 'ce-removed-tag').should('not.exist');
    });

    it('should add multiple tags', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.type('tag1, tag2{enter}', {delay: 100, force: true});

        tagField.getTags().should('have.length', 2, {timeout: 10000});
        tagField.assertTagText('tag1', 0);
        tagField.assertTagText('tag2', 1);

        contentEditor.cancelAndDiscard();
    });

    it('should not add duplicate tags', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.addNewValues(['onetag', 'threeTag', 'threetag', 'ONETAG']);

        tagField.getTags().should('have.length', 2, {timeout: 10000});
        tagField.assertTagText('onetag', 0);
        tagField.assertTagText('threetag', 1);

        contentEditor.cancelAndDiscard();
    });

    it('should not add empty tag', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.type('hello,  {enter}', {delay: 100, force: true});

        tagField.getTags().should('have.length', 1, {timeout: 10000});
        tagField.assertTagText('hello', 0);

        contentEditor.cancelAndDiscard();
    });

    it('should add a tag with special characters', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.addNewValue('$ù!é(.=;:/*');

        tagField.getTags().should('have.length', 1, {timeout: 10000});
        tagField.assertTagText('$ù!é(.=;:/*', 0);

        contentEditor.cancelAndDiscard();
    });

    it('should add tags in dynamicChoicelist field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        const tagField = contentEditor.getField(TagField, 'qant:allFieldsMultiple_dynamicChoicelist');
        tagField.addNewValue('squad-qa');
        tagField.addNewValue('team-qa');

        tagField.getTags().should('have.length', 2, {timeout: 10000});
        tagField.assertTagText('squad-qa', 0);
        tagField.assertTagText('team-qa', 1);

        contentEditor.cancelAndDiscard();
    });

    it('should have auto-completion', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.get().should('be.visible');

        tagField.type('j');

        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('jahia')
            .scrollIntoView();
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('jahia')
            .should('be.visible');

        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('j@hia')
            .scrollIntoView();
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('j@hia')
            .should('be.visible');

        tagField.clear();
        tagField.type('#');

        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('#123')
            .scrollIntoView();
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('#123')
            .should('be.visible');

        tagField.clear();
        tagField.type('1');

        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('123')
            .scrollIntoView();
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000})
            .contains('123')
            .should('be.visible');

        contentEditor.cancelAndDiscard();
    });
});
