import {JContent} from '../../../page-object';
import {RichTextField, SmallTextField} from '../../../page-object/fields';
import gql from 'graphql-tag';
import {ContentEditor} from '../../../page-object';
import {createSite, createUser, deleteSite, deleteNode, deleteUser, getNodeByPath, grantRoles} from '@jahia/cypress';

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
    });

    after(() => {
        deleteNode('/sites/digitall/contents/test');
    });

    it('can edit rich text with editor', function () {
        cy.loginAndStoreSession('bill', 'password');
        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        contentEditor = jcontent.editComponentByText('test');
        const richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
        richText.type('test');
    });
});

describe('translator permissions', () => {
    const siteKey = 'translatorPermsSite';
    const translatorLogin = {username: 'frTranslator', password: 'password'};

    before(() => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(translatorLogin.username, translatorLogin.password);
        grantRoles(`/sites/${siteKey}`, ['translator-fr'], translatorLogin.username, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(translatorLogin.username);
    });

    beforeEach(() => {
        cy.loginAndStoreSession(translatorLogin.username, translatorLogin.password);
    });

    afterEach(() => {
        cy.logout();
    });

    it('should allow a translator to edit and save a page title in French', () => {
        const jcontent = JContent.visit(siteKey, 'fr', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('Edit');
        const ce = new ContentEditor();

        ce.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue('Accueil traduit');
        ce.save();

        getNodeByPath(`/sites/${siteKey}/home`, ['jcr:title'], 'fr').then(result => {
            const props = result.data.jcr.nodeByPath.properties;
            const titleProp = props.find((prop: {name: string}) => prop.name === 'jcr:title');
            expect(titleProp.value).to.eq('Accueil traduit');
        });
    });
});

