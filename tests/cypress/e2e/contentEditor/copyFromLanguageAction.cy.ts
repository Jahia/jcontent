import {
    addNode,
    createSite,
    createUser,
    deleteSite,
    enableModule,
    getComponentByRole,
    getNodeByPath,
    grantRoles
} from '@jahia/cypress';
import {BaseComponent, Button, Dropdown} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';

describe('test Copy Language action', () => {
    const ThreeLanguagesSiteKey = 'severalLanguages';
    const editorLogin = {username: 'languagesEditor', password: 'password'};

    before('test setup', () => {
        createSite(ThreeLanguagesSiteKey, {
            languages: 'en,fr,de',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('qa-module', ThreeLanguagesSiteKey);

        createUser(editorLogin.username, editorLogin.password);
        grantRoles(`/sites/${ThreeLanguagesSiteKey}`, ['editor'], editorLogin.username, 'USER');
    });

    after('test cleanup', () => {
        cy.logout();
        deleteSite(ThreeLanguagesSiteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession(editorLogin.username, editorLogin.password);
    });

    const checkFields = (path: string, fieldValue: string, language: string) => {
        getNodeByPath(path, ['smallText', 'textarea'], language).then(result => {
            result = result.data.jcr.nodeByPath.properties;
            Cypress.$(result).each((index, property) => {
                expect(property.value).to.eq(fieldValue);
            });
        });
    };

    /** Open 'toLang' editor and copy from 'fromLang' language */
    const setCopyLanguage = (path: string, toLang: string, fromLang: string, buttonRole: string) => {
        JContent.visit(ThreeLanguagesSiteKey, toLang, path).editContent();
        getComponentByRole(Button, 'copyLanguageAction').click();

        const copyLangDialog = getComponentByRole(BaseComponent, 'copy-language-dialog');
        getComponentByRole(Dropdown, 'from-language-selector').select(fromLang);
        getComponentByRole(Button, buttonRole, copyLangDialog).click();
    };

    const checkCopyLanguageHasLang = (path: string, toLang: string, fromLang: string) => {
        JContent.visit(ThreeLanguagesSiteKey, toLang, path).editContent();
        getComponentByRole(Button, 'copyLanguageAction').click();
        getComponentByRole(Dropdown, 'from-language-selector').get().click();
        getComponentByRole(Dropdown, 'from-language-selector').should('be.visible')
            .and('contain', fromLang);
    };

    const checkCopyLanguageDoesNotHaveLang = (path: string, toLang: string, fromLang: string) => {
        JContent.visit(ThreeLanguagesSiteKey, toLang, path).editContent();
        getComponentByRole(Button, 'copyLanguageAction').click();
        getComponentByRole(Dropdown, 'from-language-selector').get().click();
        getComponentByRole(Dropdown, 'from-language-selector').should('be.visible')
            .and('not.contain', fromLang);
    };

    it('copies field from English to French and saves', () => {
        addNode({
            parentPathOrId: `/sites/${ThreeLanguagesSiteKey}/contents`,
            primaryNodeType: 'qant:allFields',
            name: 'all-fields',
            properties: [
                {name: 'smallText', value: 'Text in English', language: 'en'},
                {name: 'textarea', value: 'Text in English', language: 'en'}
            ]
        });
        const path = `/sites/${ThreeLanguagesSiteKey}/contents/all-fields`;
        checkFields(path, 'Text in English', 'en');
        checkFields(path, '', 'fr');

        const contentEditor = new ContentEditor();

        cy.log('Test cancel button works');
        setCopyLanguage('content-folders/contents/all-fields', 'fr', 'English', 'cancel-button');
        checkFields(path, '', 'fr');

        cy.log('Test apply button saves changes');
        setCopyLanguage('content-folders/contents/all-fields', 'fr', 'English', 'apply-button');
        contentEditor.save();
        checkFields(path, 'Text in English', 'fr');
    });

    it('copies empty values and saves', () => {
        addNode({
            parentPathOrId: `/sites/${ThreeLanguagesSiteKey}/contents`,
            primaryNodeType: 'qant:allFields',
            name: 'all-fields-empty',
            properties: [
                {name: 'smallText', value: 'Text in French', language: 'fr'},
                {name: 'textarea', value: 'Text in French', language: 'fr'},
                {name: 'smallText', value: '', language: 'en'},
                {name: 'textarea', value: 'Other text in English', language: 'en'}
            ]
        });
        const path = `/sites/${ThreeLanguagesSiteKey}/contents/all-fields-empty`;
        checkFields(path, 'Text in French', 'fr');

        const contentEditor = new ContentEditor();

        setCopyLanguage('content-folders/contents/all-fields-empty', 'fr', 'English', 'apply-button');
        contentEditor.save();

        getNodeByPath(path, ['smallText', 'textarea'], 'fr').then(result => {
            const props = result.data.jcr.nodeByPath.properties;

            cy.log('Check that smallText value has been removed and does not exist anymore in French');
            const smallTextProp = props.find((prop: { name: string; }) => prop.name === 'smallText');
            expect(smallTextProp).to.be.undefined;

            cy.log('Check that text area value has been copied from English to French');
            const textareaProp = props.find((prop: { name: string; }) => prop.name === 'textarea');
            expect(textareaProp.value).to.eq('Other text in English');
        });
    });

    it('copies values for multiple field and saves', () => {
        addNode({
            parentPathOrId: `/sites/${ThreeLanguagesSiteKey}/contents`,
            primaryNodeType: 'qant:allFieldsMultiple',
            name: 'all-fields-multiple',
            properties: [
                {name: 'bigtext', values: ['en1', 'en2'], language: 'en'},
                {name: 'bigtext', values: ['fr1', 'fr2'], language: 'fr'}
            ]
        });

        const path = `/sites/${ThreeLanguagesSiteKey}/contents/all-fields-multiple`;
        const contentEditor = new ContentEditor();

        setCopyLanguage('content-folders/contents/all-fields-multiple', 'fr', 'English', 'apply-button');
        contentEditor.save();

        getNodeByPath(path, ['bigtext'], 'fr').then(result => {
            const props = result.data.jcr.nodeByPath.properties;

            cy.log('Check that smallText value has been removed and does not exist anymore in French');
            const bigtextProp = props.find((prop: { name: string; }) => prop.name === 'bigtext');
            expect(bigtextProp.values[0]).to.contains('en1');
            expect(bigtextProp.values[1]).to.contains('en2');
        });
    });

    it('does not list languages with no translation', () => {
        addNode({
            parentPathOrId: `/sites/${ThreeLanguagesSiteKey}/contents`,
            primaryNodeType: 'qant:allFields',
            name: 'all-fields-two-languages',
            properties: [
                {name: 'smallText', value: 'en1', language: 'en'},
                {name: 'smallText', value: 'fr1', language: 'fr'}
            ]
        });

        let path = 'content-folders/contents/contents/all-fields-two-languages';

        checkCopyLanguageDoesNotHaveLang(path, 'en', 'German');

        addNode({
            parentPathOrId: `/sites/${ThreeLanguagesSiteKey}/contents`,
            primaryNodeType: 'qant:allFields',
            name: 'all-fields-three-languages',
            properties: [
                {name: 'smallText', value: 'en1', language: 'en'},
                {name: 'smallText', value: 'fr1', language: 'fr'},
                {name: 'smallText', value: 'de1', language: 'de'}
            ]
        });

        path = 'content-folders/contents/all-fields-three-languages';

        checkCopyLanguageHasLang(path, 'en', 'German');
    });
});
