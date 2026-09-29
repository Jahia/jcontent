import {JContent} from '../../../page-object';
import {RichTextField, SmallTextField} from '../../../page-object/fields';
import gql from 'graphql-tag';
import {ContentEditor} from '../../../page-object';
import {addNode, createSite, createUser, deleteSite, deleteNode, deleteUser, getNodeByPath, grantRoles} from '@jahia/cypress';

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

describe('page editor without write access on a sub-page', () => {
    const siteKey = 'subPagePermsSite';
    const editorLogin = {username: 'homeEditor', password: 'password'};
    const homePath = `/sites/${siteKey}/home`;
    const subPages = ['A', 'B', 'hidden', 'readOnly', 'D'];

    const breakInheritance = (path: string) => cy.executeGroovy('contentEditor/permissions/breakAclInheritance.groovy', {NODE_PATH: path});

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(editorLogin.username, editorLogin.password);
        // An area before the sub-pages, as a rendered home page has
        addNode({parentPathOrId: homePath, name: 'main', primaryNodeType: 'jnt:contentList'});
        subPages.forEach(name => addNode({
            parentPathOrId: homePath,
            name,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: name, language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ]
        }));
        grantRoles(homePath, ['editor'], editorLogin.username, 'USER');
        breakInheritance(`${homePath}/hidden`);
        breakInheritance(`${homePath}/readOnly`);
        grantRoles(`${homePath}/readOnly`, ['reviewer'], editorLogin.username, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editorLogin.username);
    });

    it('should save the home page title and keep the sub-page order', () => {
        cy.loginAndStoreSession(editorLogin.username, editorLogin.password);
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('Edit');
        const ce = new ContentEditor();

        ce.getField(SmallTextField, 'jnt:page_jcr:title').addNewValue('Home edited');
        ce.save();
        cy.logout();

        getNodeByPath(homePath, ['jcr:title'], 'en').then(result => {
            const titleProp = result.data.jcr.nodeByPath.properties.find((prop: {name: string}) => prop.name === 'jcr:title');
            expect(titleProp.value).to.eq('Home edited');
        });
        cy.apollo({query: gql`
            query subPages {
                jcr {
                    nodeByPath(path: "${homePath}") {
                        children(typesFilter: {types: ["jnt:page"]}) {
                            nodes {
                                name
                            }
                        }
                    }
                }
            }
        `}).then(result => {
            // The template set adds its own pages under the home page
            const names = result.data.jcr.nodeByPath.children.nodes
                .map((node: {name: string}) => node.name)
                .filter((name: string) => subPages.includes(name));
            expect(names).to.deep.eq(subPages);
        });
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

