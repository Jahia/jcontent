import {JContent} from '../../../page-object/jcontent';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {TagField} from '../../../page-object/fields/tagField';
import gql from 'graphql-tag';

describe('Tags tests in content editor', () => {
    let jcontent: JContent;
    const siteKey = 'tagsSite';

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
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.addNewValue('simpletag');

        tagField.getTags().should('have.length', 1);
        tagField.assertTagText('simpletag', 0);
        contentEditor.cancelAndDiscard();
    });

    it('should add multiple tags', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix:tagged_j:tagList');
        tagField.type('tag1, tag2{enter}');

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
        tagField.type('hello,  {enter}');

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
