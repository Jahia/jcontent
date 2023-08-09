import {JContent} from '../../page-object';

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
        localeName: 'Deutsch',
        localeKey: 'de'
    },
    fr: {
        title: 'French news',
        description: 'Something new happened in France',
        localeName: 'Français',
        localeKey: 'fr'
    }
};

describe('Create multi language content and verify that it is different in all languages', () => {
    let jcontent: JContent;

    beforeEach(() => {
        cy.executeGroovy('contentEditor/contentMultiLanguage/contentMultiLanguageSite.groovy', {SITEKEY: sitekey});
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
        const contentEditor = jcontent.createContent('News entry');

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
});
