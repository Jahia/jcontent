// Migrated from the legacy Selenium class PublicationAllWithWflwTest (Jahia/selenium#1661), FT-002 .. FT-005.
// FT-001, the rejection of a publication request, lives in Jahia/jahia-ee.
//
// One legacy @Test method, one continuous journey on one published page: a content of the page is changed,
// then the page is unpublished and published again. Each test starts from the state the previous one left.

import {addNode, context, createSite, deleteSite, jfaker, publishAndWaitJobEnding, waitAllJobsFinished} from '@jahia/cypress';
import gql from 'graphql-tag';
import type {Interception} from 'cypress/types/net-stubbing';
import {JContent} from '../../../page-object';

// Every site of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'unpubRepub';
const siteKey = `${prefix}${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;
const pageName = 'lifecycle';
const pagePath = `home/${pageName}`;

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

/** Opens the publication menu in the header of the page, and runs one of its entries. */
const runPublicationMenu = (role: string) => {
    const jcontent = JContent.visit(siteKey, 'en', `pages/${pagePath}`);
    cy.get('[data-sel-role="publishMenu"]', {timeout: 60000}).should('be.visible').click();
    cy.get('[data-sel-role="jcontent-publishMenu"]').find(`[data-sel-role="${role}"]`).click();
    return jcontent;
};

/** The publication status of the page, in its row of the list of the home page. */
const pageRowStatus = () => {
    const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
    jcontent.switchToListMode();
    return jcontent.getTable().getRowByName(pageName).get().find('[data-cm-role="publication-info"]');
};

const openInLive = '.moonstone-header button[data-sel-role="openInLive"]';

type GraphqlOperation = {operationName?: string; variables?: Record<string, unknown>};

// The LIVE workspace query decides `Open in live`, and the EDIT one decides `Open in preview`.
// Both are `openInActionQuery`, so the alias keeps the LIVE one only.
const isOpenInLiveQuery = (op: GraphqlOperation) => op?.operationName === 'openInActionQuery' &&
    op.variables?.workspace === 'LIVE' && op.variables?.path === `/sites/${siteKey}/${pagePath}`;

const graphqlOperations = (body: unknown): GraphqlOperation[] => (Array.isArray(body) ? body : [body]);

/**
 * Yields the publication info that `openInActionQuery` answered for the page, which decides whether the
 * header shows `Open in live`. jContent batches its queries, so the answer is found by its position.
 */
const openInLiveAnswer = () => cy.get<Interception>('@openInLiveQuery').then(interception => {
    const answers = graphqlOperations(interception.response?.body) as {data?: {jcr?: {result?: {publicationInfo?: unknown}}}}[];
    return answers[graphqlOperations(interception.request.body).findIndex(isOpenInLiveQuery)]?.data?.jcr?.result?.publicationInfo;
});

describe('Status of a published page after a change, an unpublication and a new publication', () => {
    before(() => {
        removeStaleSites();
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Lifecycle page', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'text',
                    primaryNodeType: 'jnt:text',
                    properties: [{name: 'text', value: 'Published text', language: 'en'}]
                }]
            }]
        });
        publishAndWaitJobEnding(`/sites/${siteKey}/home`, ['en']);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    it('FT-002: editing a content of a published page shows the page as modified', () => {
        context.tag('publication', 'status', 'page-modified-by-content', 'testrail-case-781868');
        JContent.visit(siteKey, 'en', `pages/${pagePath}`).assertStatusType('published');

        const jcontent = JContent.visit(siteKey, 'en', `pages/${pagePath}/area-main`);
        jcontent.switchToListMode();
        const contentEditor = jcontent.editComponentByRowName('text');
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('Changed text', true);
        contentEditor.save();

        JContent.visit(siteKey, 'en', `pages/${pagePath}`).assertStatusType('modified');
    });

    it('FT-003: unpublishing a page takes it out of live and shows it as unpublished', () => {
        context.tag('publication', 'unpublish-page', 'unpublished-status', 'testrail-case-781868');
        runPublicationMenu('unpublish');
        cy.contains('button', /^Unpublish/, {timeout: 60000}).should('be.visible').click();
        cy.get('div[id="notistack-snackbar"]', {timeout: 30000}).should('contain', 'Unpublication completed');
        waitAllJobsFinished('The unpublication job is still running');

        pageRowStatus().should('have.attr', 'data-cm-value', 'UNPUBLISHED')
            .and('contain.text', 'This content has been unpublished');
        cy.request({url: `/cms/render/live/en/sites/${siteKey}/${pagePath}.html`, failOnStatusCode: false})
            .its('status').should('eq', 404);
    });

    it('FT-004: Open in live is not offered for an unpublished page', () => {
        context.tag('open-in-live', 'unpublished-page', 'testrail-case-781868');
        cy.intercept('POST', '**/modules/graphql', req => {
            if (graphqlOperations(req.body).some(isOpenInLiveQuery)) {
                req.alias = 'openInLiveQuery';
            }
        });
        JContent.visit(siteKey, 'en', `pages/${pagePath}`).assertStatusType('notPublished');
        cy.wait('@openInLiveQuery');
        // The button is also hidden while its query loads, and Cypress sees the answer before the page
        // renders it. So the answer proves the THEN, and the absence of the button follows from it. An
        // unpublished page still exists in live, and its status is what hides the button.
        openInLiveAnswer().should('include', {status: 'UNPUBLISHED'});
        cy.get(openInLive).should('not.exist');
    });

    it('FT-005: publishing an unpublished page again shows it as published', () => {
        context.tag('publication', 'republish-page', 'testrail-case-781868');
        runPublicationMenu('publish').clickPublishNow();
        cy.get('div[id="notistack-snackbar"]', {timeout: 30000}).should('contain', 'Publication completed');
        waitAllJobsFinished('The publication job is still running');

        pageRowStatus().should('have.attr', 'data-cm-value', 'PUBLISHED');
    });
});
