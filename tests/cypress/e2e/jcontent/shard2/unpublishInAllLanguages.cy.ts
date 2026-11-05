// Migrated from the legacy Selenium class UnpublishAllLanguagesTest (Jahia/selenium#1656), FT-001, FT-002 and FT-005.
// FT-003 and FT-004, the unpublication workflows, live in Jahia/jahia-ee.

import {
    addNode,
    context,
    createSite,
    createUser,
    deleteUser,
    grantRoles,
    jfaker,
    publishAndWaitJobEnding,
    setNodeProperty,
    unpublishNode,
    waitAllJobsFinished
} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../../page-object';

// Every site and user of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'unpubAllLang';
const uniqueName = (kind: string) => `${prefix}${kind}${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;

const removeStaleFixtures = () => {
    cy.apollo({
        fetchPolicy: 'no-cache',
        query: gql`query staleFixtures($sites: String!, $users: String!) {
            jcr {
                sites: nodesByQuery(query: $sites) { nodes { name } }
                users: nodesByQuery(query: $users) { nodes { name } }
            }
        }`,
        variables: {
            sites: `SELECT * FROM [jnt:virtualsite] WHERE ISDESCENDANTNODE('/sites') AND LOCALNAME() LIKE '${prefix}%'`,
            users: `SELECT * FROM [jnt:user] WHERE LOCALNAME() LIKE '${prefix}%'`
        }
    }).then(result => {
        result.data.jcr.sites.nodes.forEach(({name}) => cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: name}));
        result.data.jcr.users.nodes.forEach(({name}) => deleteUser(name));
    });
};

const createSiteWithMainArea = (siteKey: string, languages: string[]) => {
    createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en', languages: languages.join(',')});
    if (languages.includes('de')) {
        // The home page has a title in English only, and a page without its mandatory title cannot be published in German.
        setNodeProperty(`/sites/${siteKey}/home`, 'jcr:title', 'Startseite', 'de');
    }

    addNode({parentPathOrId: `/sites/${siteKey}/home`, name: 'area-main', primaryNodeType: 'jnt:contentList'});
};

const addRichText = (siteKey: string, name: string, texts: Record<string, string>) => addNode({
    parentPathOrId: `/sites/${siteKey}/home/area-main`,
    name,
    primaryNodeType: 'jnt:bigText',
    properties: Object.entries(texts).map(([language, value]) => ({name: 'text', value, language}))
});

const liveHome = (siteKey: string, language: string) => cy.request(`/cms/render/live/${language}/sites/${siteKey}/home.html`).its('body');

const openPublishMenu = (siteKey: string, language: string, richTextName: string) => {
    const jcontent = JContent.visit(siteKey, language, 'pages/home/area-main');
    jcontent.switchToListMode();
    return jcontent.getTable().getRowByName(richTextName).contextMenu().submenu('Publish', 'jcontent-publishMenu');
};

describe('Unpublish in all languages from jContent', () => {
    const siteKey = uniqueName('Site');
    const publisher = {username: uniqueName('Publisher'), password: 'password'};

    before(() => {
        removeStaleFixtures();
        createSiteWithMainArea(siteKey, ['en', 'de']);
        createUser(publisher.username, publisher.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], publisher.username, 'USER');
    });

    after(() => {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        deleteUser(publisher.username);
        cy.logout();
    });

    it('removes the rich text from live in English and in German', () => {
        context.tag('unpublication', 'all-languages', 'without-workflow', 'testrail-case-1588013');
        const richText = uniqueName('Text');
        const en = `English text ${richText}`;
        const de = `Deutscher Text ${richText}`;
        addRichText(siteKey, richText, {en, de});
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'de']);
        liveHome(siteKey, 'en').should('contain', en);
        liveHome(siteKey, 'de').should('contain', de);

        cy.login(publisher.username, publisher.password);
        openPublishMenu(siteKey, 'en', richText).selectByRole('unpublishInAllLanguages');
        cy.get('button.x-btn-text').contains('Unpublish all').click();
        cy.get('div[id="notistack-snackbar"]', {timeout: 30000}).should('contain', 'Unpublication completed');
        waitAllJobsFinished('The unpublication job is still running');

        liveHome(siteKey, 'en').should('not.contain', en);
        liveHome(siteKey, 'de').should('not.contain', de);
    });

    it('says there is nothing to unpublish for a rich text that is no longer published', () => {
        context.tag('unpublication', 'all-languages', 'nothing-to-unpublish', 'testrail-case-1588013');
        const richText = uniqueName('Text');
        addRichText(siteKey, richText, {en: `English text ${richText}`, de: `Deutscher Text ${richText}`});
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'de']);
        unpublishNode(`/sites/${siteKey}/home/area-main/${richText}`, 'en');
        unpublishNode(`/sites/${siteKey}/home/area-main/${richText}`, 'de');
        waitAllJobsFinished('The unpublication jobs are still running');

        cy.login(publisher.username, publisher.password);
        openPublishMenu(siteKey, 'en', richText).selectByRole('unpublishInAllLanguages');

        cy.contains('Nothing to unpublish', {timeout: 30000}).should('be.visible');
    });
});

describe('Unpublish on a site with one language', () => {
    const siteKey = uniqueName('Site');
    const richText = uniqueName('Text');

    before(() => {
        removeStaleFixtures();
        // English only: jContent counts an inactive language as a language of the site.
        createSiteWithMainArea(siteKey, ['en']);
        addRichText(siteKey, richText, {en: `English text ${richText}`});
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en']);
    });

    after(() => {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    it('offers Unpublish in English and no Unpublish in all languages', () => {
        context.tag('unpublication', 'one-language-site', 'testrail-case-1588611');
        cy.login();
        const menu = openPublishMenu(siteKey, 'en', richText);

        // The entries render one by one, so wait for the whole menu before checking an entry is absent.
        menu.get().find('[data-sel-role="menu-item-skeleton"]').should('not.exist');
        menu.get().find('[data-sel-role="unpublish"]').should('be.visible').and('contain', 'English');
        menu.get().find('[data-sel-role="unpublishInAllLanguages"]').should('not.exist');
    });
});

