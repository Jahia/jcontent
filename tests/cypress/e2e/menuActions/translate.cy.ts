import {
    addNode,
    Button,
    createSite,
    createUser,
    deleteSite,
    enableModule,
    getComponent,
    getComponentByRole, getNodeByPath,
    grantRoles
} from '@jahia/cypress';
import {TranslateEditor} from "../../page-object/translateEditor";
import {JContent} from "../../page-object";
import {Field, SmallTextField} from "../../page-object/fields";
import {Dialog} from '../../page-object/dialog';

describe('translate action tests', () => {
    const siteKey = 'translateSite';
    const oneLangSite = 'oneLangSite';
    const editorLogin = {username: 'translateEditor', password: 'password'};

    const parentPath = `/sites/${siteKey}/contents`;
    const name = 'translate-field-test';

    before('test setup', () => {
        createSite(siteKey, {
            languages: 'en,fr,de',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            primaryNodeType: 'qant:allFields',
            name,
            properties: [
                {name: 'smallText', value: 'smallText in English', language: 'en'},
                {name: 'textarea', value: 'textarea in English', language: 'en'}
            ]
        });

        createSite(oneLangSite, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });

        createUser(editorLogin.username, editorLogin.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editorLogin.username, 'USER');
    });

    after('test cleanup', () => {
        cy.logout();
        deleteSite(siteKey);
        deleteSite(oneLangSite);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('cannot open translate dialog if content has only one language', () => {
        const jcontent = JContent.visit(oneLangSite, 'en', 'pages/home');
        const menu = jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu();
        menu.shouldHaveRoleItem('sbsTranslate');
        menu.get().find(`.moonstone-menuItem[data-sel-role="sbsTranslate"]`).should('have.attr', 'aria-disabled', 'true');
    });

    it('can open translate dialog on contents and has the correct settings', () => {
        const translateEditor = TranslateEditor.visitContent(siteKey, 'en', 'content-folders/contents', name);

        cy.log('Verify source language is default to English');
        translateEditor.getSourceLanguageSwitcher().isSelectedLang('en');
        translateEditor.getTranslateLanguageSwitcher().isNotSelectedLang('en');

        cy.log('Verify source column fields are read-only');
        translateEditor.getSourceFields()
            .each($field => new Field(cy.wrap($field)).isReadOnly());

        cy.log('Verify shared languages on translate column are read-only');
        translateEditor.getTranslateFields().filter('[data-sel-i18n="false"]')
            .each($field => new Field(cy.wrap($field)).isReadOnly());

        cy.log('Verify shared languages on source column do not contain translate fields button');
        translateEditor.getSourceFields().filter('[data-sel-i18n="false"]')
            .each($field => new Field(cy.wrap($field)).getTranslateFieldAction().should('not.exist'));

        cy.log('Verify translate fields are `disabled` on empty');
        [
            'qant:allFields_long',
            'qant:allFields_double',
            'qant:allFields_bigtext',
            'qant:allFields_color',
        ].forEach(fieldName => {
            translateEditor.getSourceField(SmallTextField, fieldName)
                .getTranslateFieldAction()
                .should('have.attr', 'disabled');
        });

        cy.log('Verify all sections are expanded by default');
        translateEditor.getSection('content').shouldBeExpanded();
    });

    it('can open translate dialog on pages and has the correct settings', () => {
        const translateEditor = TranslateEditor.visitPage(siteKey, 'en', 'pages/home', 'home');

        cy.log('Verify source language is default to English');
        translateEditor.getSourceLanguageSwitcher().isSelectedLang('en');
        translateEditor.getTranslateLanguageSwitcher().isNotSelectedLang('en');

        cy.log('Verify source column fields are read-only');
        translateEditor.getSourceFields()
            .each($field => new Field(cy.wrap($field)).isReadOnly());

        cy.log('Verify shared languages on translate column are read-only');
        translateEditor.getTranslateFields().filter('[data-sel-i18n="false"]')
            .each($field => new Field(cy.wrap($field)).isReadOnly());

        cy.log('Verify shared languages on source column do not contain translate fields button');
        translateEditor.getSourceFields().filter('[data-sel-i18n="false"]')
            .each($field => new Field(cy.wrap($field)).getTranslateFieldAction().should('not.exist'));

        cy.log('Verify translate fields are `disabled` on empty');
        [
            'htmlHead_jcr:description',
            'htmlHead_seoKeywords',
        ].forEach(fieldName => {
            translateEditor.getSourceField(SmallTextField, fieldName)
                .getTranslateFieldAction()
                .should('have.attr', 'disabled');
        });

        cy.log('Verify all sections are expanded by default');
        translateEditor.getSection('content').shouldBeExpanded();
        translateEditor.getSection('seo').shouldBeExpanded();
    });

    it('can translate fields', () => {
        const translateEditor = TranslateEditor.visitContent(siteKey, 'en', 'content-folders/contents', name);

        cy.log('Copy smallText from en to fr');
        translateEditor.getTranslateLanguageSwitcher().selectLangByValue('fr');
        translateEditor
            .getSourceField(Field, 'qant:allFields_smallText')
            .getTranslateFieldAction()
            .click();

        cy.log('Add user translation in de for long field');
        translateEditor.getTranslateLanguageSwitcher().selectLangByValue('de');
        translateEditor
            .getTranslateField(SmallTextField, 'qant:allFields_long')
            .addNewValue('123');

        cy.log('Copy textarea from en to de');
        translateEditor
            .getSourceField(Field, 'qant:allFields_textarea')
            .getTranslateFieldAction()
            .click();

        cy.log('Verify smallText changes in fr is still available');
        translateEditor.getTranslateLanguageSwitcher().selectLangByValue('fr');
        translateEditor.getTranslateField(SmallTextField, 'qant:allFields_smallText').checkValue('smallText in English');

        cy.log('Verify close prompts unsaved changes');
        getComponentByRole(Button, 'backButton').click()
        getComponent(Dialog).get().contains('Unsaved changes').should('be.visible');
        getComponentByRole(Button, 'close-dialog-cancel').click();

        translateEditor.saveUnchecked();

        getNodeByPath(`${parentPath}/${name}`, ['smallText'], 'fr').then(result => {
            cy.log('Verify fr translations');
            const props = result.data.jcr.nodeByPath.properties;
            const prop = props.find((prop: { name: string; }) => prop.name === 'smallText');
            expect(prop.value).to.eq('smallText in English');
        });

        getNodeByPath(`${parentPath}/${name}`, ['long', 'textarea'], 'de').then(result => {
            cy.log('Verify de translations');
            const props = result.data.jcr.nodeByPath.properties;
            const longProp = props.find((prop: { name: string; }) => prop.name === 'long');
            expect(longProp.value).to.eq('123');
            const textareaProp = props.find((prop: { name: string; }) => prop.name === 'textarea');
            expect(textareaProp.value).to.eq('textarea in English');
        });
    });

});
