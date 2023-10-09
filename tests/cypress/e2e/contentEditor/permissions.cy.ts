import {JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';
import gql from 'graphql-tag';
import {deleteNode} from '@jahia/cypress';

describe('permissions', () => {
    let jcontent: JContent;
    let contentEditor;

    before(() => {
        cy.apollo({mutation: gql`
                mutation createContent {
                    jcr {
                        mutateNode(pathOrId: "/sites/digitall/contents") {
                            addChild(name: "test", primaryNodeType: "jnt:bigText") {
                                grantRoles(principalName: "bill", principalType:USER, roleNames: "editor")
                                mutateChildren(names: "j:acl") {
                                    mutateProperty(name: "j:inherit") {
                                        setValue(value: "false")
                                    }
                                }
                            }
                        }
                    }
                }
            `});
        cy.loginAndStoreSession('bill', 'password');

        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        contentEditor = jcontent.editComponentByText('test');
    });

    after(() => {
        deleteNode('/sites/digitall/contents/test');
    });

    it('can edit rich text with editor', function () {
        const richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
        richText.type('test');
    });
});

