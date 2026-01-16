import {ContentEditor, JContent} from '../../page-object';
import {addNode, enableModule} from '@jahia/cypress';

interface Subject {
    title: string,
    description: string,
    localeName: string,
    localeKey: string,
}

const sitekey = 'contentMultiLanguage';

const newsByLanguage = {
    en: {
        title: 'English news',
        description: 'Something new happened in England',
        localeName: 'English',
        localeKey: 'en'
    },
    de: {
        title: 'German news',
        description: 'Something new happened in Germany',
        localeName: 'German',
        localeKey: 'de'
    },
    fr: {
        title: 'French news',
        description: 'Something new happened in France',
        localeName: 'French',
        localeKey: 'fr'
    }
};

describe('Create multi language content and verify that it is different in all languages', () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('contentEditor/contentMultiLanguage/contentMultiLanguageSite.groovy', {SITEKEY: sitekey});
        enableModule('qa-module', sitekey);
        addNode({
            parentPathOrId: `/sites/${sitekey}/contents`,
            name: 'AllFieldsMulti',
            primaryNodeType: 'qant:allFields',
            properties: [{name: "sharedSmallText", value: "Initial text", language: "en"}, {name: "sharedTextarea", value: "Initial text in area", language: "en"}]
        });
        addNode({
            parentPathOrId: `/sites/${sitekey}/contents`,
            name: 'My news',
            primaryNodeType: 'jnt:news',
            properties: [
                {name: 'jcr:title', value: 'News in English', language: 'en'}
            ]
        });
        cy.apollo({
            mutationFile: 'contentEditor/contentMultiLanguage/setPropertyValue.graphql',
            variables: {
                prop: 'jcr:title',
                lang: 'de',
                value: 'Home',
                path: `/sites/${sitekey}/home`
            }
        });
        cy.apollo({
            mutationFile: 'contentEditor/contentMultiLanguage/setPropertyValue.graphql',
            variables: {
                prop: 'jcr:title',
                lang: 'fr',
                value: 'Home',
                path: `/sites/${sitekey}/home`
            }
        });
    });

    beforeEach( () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/contents');
    })

    afterEach(function () {
        cy.logout();
    });

    after( () => {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
    })

    const fillNews = (contentEditor, data: Subject) => {
        // Fill title and description
        contentEditor.getLanguageSwitcher().select(data.localeName);
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue(data.title);
        contentEditor.getRichTextField('jnt:news_desc').addNewValue(data.description);
    };

    const testNewsCreation = (s: Subject) => {
        jcontent.getLanguageSwitcher().select(s.localeKey);
        jcontent.getTable().getRowByLabel(s.title);
    };

    const fieldsWithBadge = [
        "qant:allFields_sharedSmallText", "qant:allFields_sharedTextarea"
    ];

    const fieldsWithoutBadge = [
        "qant:allFields_smallText", "qant:allFields_textarea"
    ];

    it('Can create content in 3 languages', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('jnt:news');

        cy.log('Create news entry in 3 languages');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create News entry');

        fillNews(contentEditor, newsByLanguage.en);
        fillNews(contentEditor, newsByLanguage.de);
        fillNews(contentEditor, newsByLanguage.fr);

        contentEditor.create();

        cy.log('Verify news entries were created in 3 languages');
        testNewsCreation(newsByLanguage.en);
        testNewsCreation(newsByLanguage.fr);
        testNewsCreation(newsByLanguage.de);
    });

    it('Updates warning badge when the site has mandatory languages', () => {
        jcontent.editComponentByRowName('My news');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        // Check warning badge is displayed
        cy.get('div[data-status-type="warning"]', {timeout: 5000}).should('exist');
        // Switch to French
        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('fr');
        // Check warning badge is displayed
        cy.get('div[data-status-type="warning"]', {timeout: 5000}).should('exist');

        // Publish in English then check the warning badge
        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('en');
        contentEditor.publish();
        cy.get('div[data-status-type="warning"]', {timeout: 5000}).should('exist');
        contentEditor.getLanguageSwitcherAdvancedMode().selectLangByValue('fr');

        // Fill the title in French
        contentEditor.getSmallTextField('jnt:news_jcr:title').addNewValue('News in French');

        contentEditor.save();
        // Check warning badge is not displayed after save
        cy.get('div[data-status-type="warning"]', {timeout: 5000}).should('not.exist');
    });

    it('Checks "shared by all languages" badge', () => {
        jcontent.editComponentByRowName('AllFieldsMulti');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        // Check "shared by all languages" badge is displayed on internationalized fields
        fieldsWithBadge.forEach((field) => {
            cy.get(`[data-sel-content-editor-field="${field}"]`)
                .find('.moonstone-chip span')
                .should('contain', 'Shared by all languages');
        });

        // Check "shared by all languages" badge is NOT displayed on non internationalized fields
        fieldsWithoutBadge.forEach((field) => {
            cy.get(`[data-sel-content-editor-field="${field}"]`)
                .find('.moonstone-chip')
                .should('not.exist');
        });
        contentEditor.cancel();
    });
});
