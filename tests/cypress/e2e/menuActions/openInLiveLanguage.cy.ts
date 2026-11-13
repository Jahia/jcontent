// Migrated from the legacy Selenium class PublicationOneNodeTest (Jahia/selenium#1654), FT-005 and FT-006.
// FT-001 .. FT-003, the request and the acceptance of the publication, live in Jahia/jahia-ee.
// FT-004 is dropped at review: openInLive.cy.ts already checks the button on a published English page.
//
// The legacy test read the `Live` item of the page composer, which is greyed out for a page that is not
// published. In jContent, `Open in live` is hidden instead, so these tests check that it is present or absent.

import {addNode, context, createSite, deleteSite, jfaker, publishAndWaitJobEnding, setNodeProperty} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../page-object';

// Every site of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'openInLiveLang';
const siteKey = `${prefix}${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;

const removeStaleSites = () => {
    cy.apollo({
        fetchPolicy: 'no-cache',
        query: gql`query staleSites($sites: String!) {
            jcr {
                nodesByQuery(query: $sites) { nodes { name } }
            }
        }`,
        variables: {sites: `SELECT * FROM [jnt:virtualsite] WHERE ISDESCENDANTNODE('/sites') AND LOCALNAME() LIKE '${prefix}%'`}
    }).then(result => result.data.jcr.nodesByQuery.nodes.forEach(({name}) => deleteSite(name)));
};

const addPage = (name: string, titles: Record<string, string>) => addNode({
    parentPathOrId: `/sites/${siteKey}/home`,
    name,
    primaryNodeType: 'jnt:page',
    properties: [
        ...Object.entries(titles).map(([language, value]) => ({name: 'jcr:title', value, language})),
        {name: 'j:templateName', type: 'STRING', value: 'simple'}
    ]
});

const openInLive = '.moonstone-header button[data-sel-role="openInLive"]';

/**
 * Aliases the query that decides whether the header shows `Open in live`, for one page in one language.
 * The button is also hidden while this query loads, so an absence is only meaningful once it has answered.
 */
const aliasOpenInLiveQuery = (pagePath: string, language: string) => {
    cy.intercept('POST', '**/modules/graphql', req => {
        const operations = Array.isArray(req.body) ? req.body : [req.body];
        if (operations.some(op => op?.operationName === 'openInActionQuery' && op.variables?.path === `/sites/${siteKey}/${pagePath}` && op.variables?.language === language)) {
            req.alias = 'openInLiveQuery';
        }
    });
};

/** Resolves after the browser has painted twice, so that React has rendered what the last answer changed. */
const nextPaints = () => cy.window().then(win => new Cypress.Promise<void>(resolve => {
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
}));

/** Waits until the query of the button has answered for this page and language, then checks there is no button. */
const expectNoOpenInLive = () => {
    cy.wait('@openInLiveQuery');
    nextPaints();
    cy.get(openInLive).should('not.exist');
};

describe('Open in live for a page that is not published in the selected language', () => {
    before(() => {
        removeStaleSites();
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en', languages: 'en,fr'});
        // Every page has a French title, so that only the publication decides what is in live in French.
        setNodeProperty(`/sites/${siteKey}/home`, 'jcr:title', 'Accueil', 'fr');
        addPage('first', {en: 'First page', fr: 'Première page'});
        addPage('second', {en: 'Second page', fr: 'Deuxième page'});

        // The home page and its sub-pages are published in English, and only the first sub-page in French.
        publishAndWaitJobEnding(`/sites/${siteKey}/home`, ['en']);
        publishAndWaitJobEnding(`/sites/${siteKey}/home/first`, ['fr']);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    it('FT-005: Open in live is not offered for the same page in a language it is not published in', () => {
        context.tag('open-in-live', 'unpublished-language', 'testrail-case-781869');
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.assertStatusType('published');
        cy.get(openInLive).should('be.visible');

        aliasOpenInLiveQuery('home', 'fr');
        jcontent.getLanguageSwitcher().select('fr');
        jcontent.assertStatusType('notPublished');
        expectNoOpenInLive();
    });

    it('FT-006: Open in live is not offered for a sibling page that was not published', () => {
        context.tag('open-in-live', 'unpublished-sibling', 'testrail-case-781869');
        JContent.visit(siteKey, 'fr', 'pages/home/first').assertStatusType('published');
        cy.get(openInLive).should('be.visible');

        aliasOpenInLiveQuery('home/second', 'fr');
        JContent.visit(siteKey, 'fr', 'pages/home/second').assertStatusType('notPublished');
        expectNoOpenInLive();
    });
});
