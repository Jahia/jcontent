import {JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('richText', () => {
    const siteKey = 'richTextSite';

    function addCk5Exclude(_siteKey: string) {
        // We use CK4 for now for this test
        return cy.apollo({mutation: gql`mutation disableCK5 {
                admin {
                    jahia {
                        configuration(pid:"org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "excludeSites") {
                                addValue(value: "${_siteKey}")
                            }
                        }
                    }
                }
        }`});
    }

    before(() => {
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'all-fields-multiple',
            primaryNodeType: 'qant:allFieldsMultiple',
            properties: [
                {name: 'sharedBigtext', values: ['<p>value 1</p>', '<p>value 2</p>'], language: 'en'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'richText',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: 'value1', language: 'en'}]
        });
        addCk5Exclude(siteKey);
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('can edit rich text with ckeditor', () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents/richText').editContent();
        const richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
        richText.type('test');
    });

    it('shows ckeditor notifications', () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents/richText').editContent();
        const richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
        richText.get().find('.cke_button__paste_icon').parent().should('have.attr', 'aria-disabled', 'false').click();
        cy.get('.cke_notifications_area');
    });

    it('can edit multiple rich text fields without side effects', () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents/all-fields-multiple').editContent();
        const richText = contentEditor.getField(RichTextField, 'qant:allFieldsMultiple_sharedBigtext');

        richText.getData(0).should('have.string', 'value 1');
        richText.setData('This is my text 1 data', 0);
        richText.setData('This is my text 2 data', 1);

        cy.log('Verify that the change in rich text 2 does not revert change in rich text 1');
        richText.getData(0).should('have.string', 'This is my text 1 data');
    });
});

