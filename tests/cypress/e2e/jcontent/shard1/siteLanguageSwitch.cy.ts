// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650), FT-001 to FT-005.

import {context, createSite, setNodeProperty} from '@jahia/cypress';
import {ContentEditor, JContent, SidePanel} from '../../../page-object';

const siteKey = 'siteLanguageSwitchSite';
const germanHomeTitle = 'Startseite';
const ceSelector = ContentEditor.defaultSelector;

const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
};

const openHomeInContentEditor = (): ContentEditor => {
    const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    return jcontent.editPage();
};

// The editor lists the site languages in its own switcher, labelled in the UI language.
const checkEditorLanguages = () => {
    cy.get(`${ceSelector} [data-cm-role="language-switcher"]`)
        .should('have.attr', 'data-selected-value', 'en')
        .and('contain', 'English')
        .click();
    cy.get('menu.moonstone-menu [role="option"]').should($options => {
        const languages = [...$options].map(option => option.dataset.value).sort();
        expect(languages).to.deep.equal(['de', 'en', 'fr']);
    });
    cy.contains('menu.moonstone-menu [role="option"]', 'English').should('be.visible');
    cy.contains('menu.moonstone-menu [role="option"]', 'German').should('be.visible');
    cy.contains('menu.moonstone-menu [role="option"]', 'French').should('be.visible');
    cy.get('body').type('{esc}');
};

// A site switch keeps the jContent path of the previous site, so Pages is opened explicitly.
const switchToTestSiteAndOpenHome = (jcontent: JContent) => {
    jcontent.getSiteSwitcher().select(siteKey);
    cy.url().should('contain', `/jcontent/${siteKey}/`);
    jcontent.getAccordionItem('pages').click();
    jcontent.getAccordionItem('pages').getTreeItem('home').click();
};

// Page Builder is the default view of a page, where the legacy UI showed its list view.
const checkContentViewLoaded = () => {
    cy.get('[data-sel-role="page-builder-frame-active"]').should('be.visible');
};

describe('Site and language switchers with the content editor', () => {
    before(() => {
        removeFixtures();
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
            languages: 'en,de,fr'
        });
        setNodeProperty(`/sites/${siteKey}/home`, 'jcr:title', germanHomeTitle, 'de');
    });

    after(() => {
        cy.logout();
        removeFixtures();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Content editor lists the site languages', () => {
        context.tag('jcontent', 'content-editor', 'language-list');

        openHomeInContentEditor();

        checkEditorLanguages();
    });

    it('Switching to System Site opens its content folders', () => {
        context.tag('jcontent', 'site-switcher', 'system-site');
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');

        jcontent.getSiteSwitcher().select('System Site');

        cy.url().should('contain', '/jcontent/systemsite/en/content-folders/contents');
        cy.get('.moonstone-header h1').should('contain', 'contents');
    });

    it('A language missing on the target site falls back on site switch', () => {
        context.tag('jcontent', 'site-switcher', 'language-fallback');
        const jcontent = JContent.visit('systemsite', 'es', 'content-folders/contents');
        jcontent.getLanguageSwitcher().get().find('.moonstone-pill').should('have.text', 'es');

        switchToTestSiteAndOpenHome(jcontent);

        cy.url().should('contain', `/jcontent/${siteKey}/en/pages/home`);
        jcontent.getAccordionItem('pages').getTreeItem('home').get().should('contain', 'Home');
        cy.get('.moonstone-header h1').should('contain', 'Home');
        checkContentViewLoaded();
    });

    it('The content editor edits the node of the switched-to site', () => {
        context.tag('jcontent', 'content-editor', 'site-switch-path');
        const jcontent = JContent.visit('systemsite', 'en', 'content-folders/contents');
        switchToTestSiteAndOpenHome(jcontent);

        const contentEditor = jcontent.editPage();
        contentEditor.switchToAdvancedMode();
        new SidePanel().inCE().switchToDetailsTab();

        new SidePanel().inCE().getDetailRow('Path').should('contain', `/sites/${siteKey}/home`);
        checkEditorLanguages();
    });

    it('A language chosen on another site carries over on site switch', () => {
        context.tag('jcontent', 'site-switcher', 'language-carry-over');
        const jcontent = JContent.visit('systemsite', 'de', 'content-folders/contents');
        jcontent.getLanguageSwitcher().get().find('.moonstone-pill').should('have.text', 'de');

        switchToTestSiteAndOpenHome(jcontent);

        cy.url().should('contain', `/jcontent/${siteKey}/de/pages/home`);
        jcontent.getAccordionItem('pages').getTreeItem('home').get().should('contain', germanHomeTitle);
        cy.get('.moonstone-header h1').should('contain', germanHomeTitle);
        checkContentViewLoaded();
    });
});
