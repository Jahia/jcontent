import {ContentEditor, JContent} from '../../page-object';
import {addNode} from "@jahia/cypress";

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

    beforeEach(() => {
        cy.executeGroovy('contentEditor/contentMultiLanguage/contentMultiLanguageSite.groovy', {SITEKEY: sitekey});
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

        cy.loginAndStoreSession();
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/contents');
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
    });

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
});
