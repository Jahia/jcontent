import {JContent} from '../../page-object/jcontent';
import {
    addNode,
    enableModule
} from '@jahia/cypress';
import {TagField} from '../../page-object/fields/tagField';
import gql from 'graphql-tag';

describe('Tags tests in content editor', () => {
    let jcontent: JContent;
    const siteKey = 'tagsSite';

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
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
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
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

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.addNewValue('simpletag');

        tagField.get().find('[role="button"] span').should('have.length', 1, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', 'simpletag');
        contentEditor.cancelAndDiscard();
    });

    it('should add multiple tags', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.get().find('input[type="text"]').type('tag1, tag2{enter}', {delay: 100, force: true});

        tagField.get().find('[role="button"] span').should('have.length', 2, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', 'tag1');
        tagField.get().find('[role="button"] span').eq(1).should('have.text', 'tag2');
        contentEditor.cancelAndDiscard();
    });

    it('should not add duplicate tags', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.get().find('input[type="text"]').type('onetag, threeTag, twotag, threetag, ONETAG, twotags{enter}', {delay: 100, force: true});

        tagField.get().find('[role="button"] span').should('have.length', 4, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', 'onetag');
        tagField.get().find('[role="button"] span').eq(1).should('have.text', 'threetag');
        tagField.get().find('[role="button"] span').eq(2).should('have.text', 'twotag');
        tagField.get().find('[role="button"] span').eq(3).should('have.text', 'twotags');
        contentEditor.cancelAndDiscard();
    });

    it('should not add empty tag', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.get().find('input[type="text"]').type('hello,  {enter}', {delay: 100, force: true});

        tagField.get().find('[role="button"] span').should('have.length', 1, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', 'hello');
        contentEditor.cancelAndDiscard();
    });

    it('should add a tag with special characters', () => {
        const contentEditor = jcontent.editComponentByRowName('myTextForTags');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.addNewValue('$ù!é(.=;:/*');

        tagField.get().find('[role="button"] span').should('have.length', 1, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', '$ù!é(.=;:/*');
        contentEditor.cancelAndDiscard();
    });

    it('should add tags in dynamicChoicelist field', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsMultiple');
        contentEditor.switchToAdvancedMode();

        const tagField = contentEditor.getField(TagField, 'qant\\:allFieldsMultiple_dynamicChoicelist');
        tagField.addNewValue('squad-qa');
        tagField.addNewValue('team-qa');
        tagField.get().find('[role="button"] span').should('have.length', 2, {timeout: 2000});
        tagField.get().find('[role="button"] span').eq(0).should('have.text', 'squad-qa');
        tagField.get().find('[role="button"] span').eq(1).should('have.text', 'team-qa');
        contentEditor.cancelAndDiscard();
    });

    it('should have auto-completion', () => {
        const contentEditor = jcontent.editComponentByRowName('allFieldsSimple');
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('Classification and Metadata');
        contentEditor.toggleOption('jmix:tagged', 'Tags');

        const tagField = contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        contentEditor.getField(TagField, 'jmix\\:tagged_j\\:tagList');
        tagField.get().find('input[type="text"]').type('j', {delay: 100, force: true});
        cy.get('[class*="css-26l3qy-menu"]').scrollIntoView();
        cy.get('[class*="css-26l3qy-menu"]').within(() => {
            cy.contains('jahia').should('be.visible');
            cy.contains('j@hia').should('be.visible');
        });
        tagField.get().find('input[type="text"]').clear();
        tagField.get().find('input[type="text"]').type('#', {delay: 100, force: true});
        cy.get('[class*="css-26l3qy-menu"]').scrollIntoView();
        cy.get('[class*="css-26l3qy-menu"]').within(() => {
            cy.contains('#123').should('be.visible');
        });
        tagField.get().find('input[type="text"]').clear();
        tagField.get().find('input[type="text"]').type('1', {delay: 100, force: true});
        cy.get('[class*="css-26l3qy-menu"]').scrollIntoView();
        cy.get('[class*="css-26l3qy-menu"]').within(() => {
            cy.contains('123').should('be.visible');
        });
        contentEditor.cancelAndDiscard();
    });
});
