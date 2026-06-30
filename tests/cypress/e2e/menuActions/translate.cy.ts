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
import {TranslateEditor} from '../../page-object/translateEditor';
import {ContentEditor, JContent} from '../../page-object';
import {Field, SmallTextField} from '../../page-object/fields';
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
        // Visibility check menu displayed
        menu.shouldHaveRoleItem('editPage');
        menu.get().find('.moonstone-menuItem[data-sel-role="sbsTranslate"]').should('not.exist');
    });

    it('cannot open on invalid node types e.g. folders', () => {
        const jcontent = JContent.visit(oneLangSite, 'en', 'media/files').switchToListMode();
        jcontent.getTable()
            .getRowByName('bootstrap')
            .contextMenu()
            .shouldNotHaveRoleItem('sbsTranslate');
    });

    it('can open translate dialog on contents and has the correct settings', () => {
        const translateEditor = TranslateEditor.visitContent(siteKey, 'en', 'content-folders/contents', name);

        cy.log('Verify source language is default to English');
        translateEditor.getSourceLanguageSwitcher().isSelectedLang('de');
        translateEditor.getTranslateLanguageSwitcher().isSelectedLang('en');

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
            'qant:allFields_color'
        ].forEach(fieldName => {
            translateEditor.getSourceField(SmallTextField, fieldName)
                .getTranslateFieldAction()
                .should('have.attr', 'disabled');
        });

        cy.log('Verify all sections are expanded by default');
        translateEditor.getTranslateSection('content').shouldBeExpanded();
    });

    it('can open translate dialog on pages and has the correct settings', () => {
        const translateEditor = TranslateEditor.visitPage(siteKey, 'en', 'pages/home', 'home');

        cy.log('Verify source language is the first one (german)');
        translateEditor.getSourceLanguageSwitcher().isSelectedLang('de');
        translateEditor.getTranslateLanguageSwitcher().isSelectedLang('en');

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
            'htmlHead_seoKeywords'
        ].forEach(fieldName => {
            translateEditor.getSourceField(SmallTextField, fieldName)
                .getTranslateFieldAction()
                .should('have.attr', 'disabled');
        });

        cy.log('Verify all sections are expanded by default');
        translateEditor.getTranslateSection('content').shouldBeExpanded();
        translateEditor.getTranslateSection('seo').shouldBeExpanded();
    });

    it('can translate fields', () => {
        const translateEditor = TranslateEditor.visitContent(siteKey, 'en', 'content-folders/contents', name);

        cy.log('Copy smallText from en to fr');
        translateEditor.getTranslateLanguageSwitcher().selectLangByValue('fr');
        translateEditor.getSourceLanguageSwitcher().selectLangByValue('en');
        translateEditor
            .getSourceField(Field, 'qant:allFields_smallText')
            .getTranslateFieldAction()
            .click();

        cy.log('Add user translation in de for long field');
        cy.waitUntil(() => translateEditor.getTranslateLanguageSwitcher().selectLangByValue('de'));
        translateEditor.getTranslateColumn().get().find('.moonstone-loader', {timeout: 5000}).should('not.exist');
        translateEditor
            .getTranslateField(SmallTextField, 'qant:allFields_long')
            .addNewValue('123');

        cy.log('Copy textarea from en to de');
        translateEditor
            .getSourceField(Field, 'qant:allFields_textarea')
            .getTranslateFieldAction()
            .click();

        cy.log('Verify smallText changes in fr is still available');
        cy.waitUntil(() => translateEditor.getTranslateLanguageSwitcher().selectLangByValue('fr'));
        translateEditor.getTranslateField(SmallTextField, 'qant:allFields_smallText').checkValue('smallText in English');

        cy.log('Verify close prompts unsaved changes');
        getComponentByRole(Button, 'backButton').click();
        getComponent(Dialog).get().contains('Unsaved changes').should('be.visible');
        getComponentByRole(Button, 'close-dialog-cancel').click();

        translateEditor.save();

        getNodeByPath(`${parentPath}/${name}`, ['smallText'], 'fr').then(result => {
            cy.log('Verify fr translations');
            const props = result.data.jcr.nodeByPath.properties;
            const smallTextProp = props.find((prop: { name: string; }) => prop.name === 'smallText');
            expect(smallTextProp.value).to.eq('smallText in English');
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

    it('stays in edit mode when switching the editing language', () => {
        const contentEditor = ContentEditor.visit(`${parentPath}/${name}`, siteKey, 'en', 'content-folders/contents');
        const jcontent = new JContent();

        cy.log('Editor opens in edit mode');
        jcontent.assertHeaderActionSelected('tab-edit');

        cy.log('Switch the editing language from en to fr');
        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('fr');

        cy.log('Mode is still edit after the language switch (selector unchanged, form not remounted)');
        jcontent.assertHeaderActionSelected('tab-edit');
    });

    it('stays in translate mode when switching the target language', () => {
        ContentEditor.visit(`${parentPath}/${name}`, siteKey, 'en', 'content-folders/contents');
        const jcontent = new JContent();
        const translateEditor = new TranslateEditor();

        cy.log('Editor opens in edit mode, then user switches mode to translate via the header dropdown');
        jcontent.assertHeaderActionSelected('tab-edit');
        jcontent.selectHeaderTab('tab-translate');
        jcontent.assertHeaderActionSelected('tab-translate');
        translateEditor.getTranslateColumn().get().find('.moonstone-loader', {timeout: 10000}).should('not.exist');

        cy.log('Change the target (editable) language from en to fr');
        translateEditor.getTranslateLanguageSwitcher().selectLangByValue('fr');
        translateEditor.getTranslateColumn().get().find('.moonstone-loader', {timeout: 10000}).should('not.exist');

        cy.log('Mode is still translate after the language switch (form not remounted) — regression guard for #2483');
        jcontent.assertHeaderActionSelected('tab-translate');
        translateEditor.getTranslateLanguageSwitcher().isSelectedLang('fr');
    });

    it('opens directly in translate mode when forced through the editor config (custom UI)', () => {
        // Mirrors how a custom UI opens Content Editor in a chosen mode: window.CE_API.edit(CE_CONFIG)
        JContent.visit(siteKey, 'en', 'content-folders/contents');

        cy.window().its('CE_API').invoke('edit', {
            path: `${parentPath}/${name}`,
            site: siteKey,
            lang: 'en',
            isFullscreen: true,
            advancedOpenTab: 'TRANSLATE', // Constants.editPanel.translateTab
            sideBySideContext: {lang: 'de'} // Source (read-only) language
        });

        const translateEditor = new TranslateEditor();
        translateEditor.getTranslateColumn().get().find('.moonstone-loader', {timeout: 10000}).should('not.exist');
        translateEditor.getSourceColumn().get().find('.moonstone-loader', {timeout: 10000}).should('not.exist');

        cy.log('Editor opened directly in translate mode');
        new JContent().assertHeaderActionSelected('tab-translate');

        cy.log('Editable language on the left, forced source language on the right');
        translateEditor.getTranslateLanguageSwitcher().isSelectedLang('en');
        translateEditor.getSourceLanguageSwitcher().isSelectedLang('de');
    });
});
