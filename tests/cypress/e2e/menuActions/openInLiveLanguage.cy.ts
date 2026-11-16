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

type GraphqlOperation = {operationName?: string; variables?: Record<string, unknown>};

const graphqlOperations = (body: unknown): GraphqlOperation[] => (Array.isArray(body) ? body : [body]);

// The LIVE workspace query decides `Open in live`, and the EDIT one decides `Open in preview`.
// Both are `openInActionQuery`, so the alias keeps the LIVE one only.
const isOpenInLiveQuery = (op: GraphqlOperation, pagePath: string, language: string) => op?.operationName === 'openInActionQuery' &&
    op.variables?.workspace === 'LIVE' && op.variables?.path === `/sites/${siteKey}/${pagePath}` && op.variables?.language === language;

/** Aliases the query that decides whether the header shows `Open in live`, for one page in one language. */
const aliasOpenInLiveQuery = (pagePath: string, language: string) => {
    cy.intercept('POST', '**/modules/graphql', req => {
        if (graphqlOperations(req.body).some(op => isOpenInLiveQuery(op, pagePath, language))) {
            req.alias = 'openInLiveQuery';
        }
    });
};

/**
 * Waits until the query of the button has answered for this page and language, and checks that the
 * answer says the page is not published in that language. The node exists in live through its English
 * version, so its status is what hides the button. The button is also hidden while its query loads, and Cypress
 * sees the answer before the page renders it. So the answer proves the THEN, and the absence of the
 * button follows from it. jContent batches its queries, so the answer is found by its position.
 */
const expectNoOpenInLive = (pagePath: string, language: string) => {
    cy.wait('@openInLiveQuery').then(interception => {
        const answers = graphqlOperations(interception.response?.body) as {data?: {jcr?: {result?: {publicationInfo?: unknown}}}}[];
        const index = graphqlOperations(interception.request.body).findIndex(op => isOpenInLiveQuery(op, pagePath, language));
        expect(answers[index]?.data?.jcr?.result?.publicationInfo, `the publication info of ${pagePath} in ${language}`).to.include({status: 'NOT_PUBLISHED'});
    });
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
        expectNoOpenInLive('home', 'fr');
    });

    it('FT-006: Open in live is not offered for a sibling page that was not published', () => {
        context.tag('open-in-live', 'unpublished-sibling', 'testrail-case-781869');
        JContent.visit(siteKey, 'fr', 'pages/home/first').assertStatusType('published');
        cy.get(openInLive).should('be.visible');

        aliasOpenInLiveQuery('home/second', 'fr');
        JContent.visit(siteKey, 'fr', 'pages/home/second').assertStatusType('notPublished');
        expectNoOpenInLive('home/second', 'fr');
    });
});
