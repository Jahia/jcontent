// Migrated from the legacy Selenium class org.jahia.selenium.scripts.publication.StartAllWorkflowsTest
// (tracking issue Jahia/selenium#1600). Covers FT-001, the only one of that class's eight FTs whose
// assertion lives in jContent; the other seven are mail, workflow-dashboard and live-rendering
// assertions and land in jahia-ee.
//
// The dialog under test is raised by core, not by jContent: PublicationWorkflow's publication-info
// callback splits the nodes it got back into publishable and unpublishable, and when both sets are
// non-empty it opens a GXT confirm box listing the unpublishable ones under their status label
// (label.publication.mandatorylanguageunpublishable) followed by message.continue. Choosing Yes
// continues with the publishable remainder. jContent's "publish all in all languages" action is one
// of the entry points into that callback, which is why the case belongs here.
//
// The site therefore needs a language the page was never translated into: publication resolves the
// status per locale, and a page with no i18n node for `es` is MANDATORY_LANGUAGE_UNPUBLISHABLE there
// while staying publishable in `en` and `fr`. No mandatory-language configuration is involved.

import {addNode, context, createSite, createUser, deleteSite, deleteUser, grantRoles, jfaker} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const PREFIX = 'pubwarn';
const suffix = jfaker.string.alphanumeric({length: 6, casing: 'lower'});
const siteKey = `${PREFIX}${suffix}`;
const pageName = 'wkfpage';
const editor = {username: `${PREFIX}${suffix}editor`, password: 'password'};

describe('Publish all in all languages, with content untranslated in one of them', () => {
    before(() => {
        cy.executeGroovy('jcontent/deleteSitesAndUsersByPrefix.groovy', {PREFIX});

        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
            languages: 'en,fr,es'
        });
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');

        // Titled in en and fr only — nothing for es, which is what makes the page unpublishable there.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Workflow page', language: 'en'},
                {name: 'jcr:title', value: 'Page de workflow', language: 'fr'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ],
            children: [{
                name: 'pagecontent',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'text',
                    primaryNodeType: 'jnt:bigText',
                    properties: [
                        {name: 'text', type: 'STRING', value: 'Fabrice went to Peru', language: 'en'},
                        {name: 'text', type: 'STRING', value: 'Fabrice est allé au Pérou', language: 'fr'}
                    ]
                }]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
        deleteUser(editor.username);
        cy.logout();
    });

    it('warns about the missing mandatory property and publishes the rest when the editor continues', () => {
        context.tag('publication', 'multilanguage', 'workflow', 'warning-dialog', 'page-composer');
        cy.login(editor.username, editor.password);
        const jcontent = JContent.visit(siteKey, 'en', `pages/home/${pageName}`);
        jcontent.getHeaderActionButton('publishMenu').should('exist');

        cy.get('[data-sel-role="publishMenu"]').click();
        cy.get('[data-sel-role="jcontent-publishMenu"]')
            .find('[data-sel-role="publishAllInAllLanguages"]')
            .click();

        cy.log('The warning names the blocked language and offers to continue');
        cy.contains('Content cannot be published in the current language because of a missing mandatory property', {timeout: 60000})
            .should('be.visible');
        cy.contains('Would you like to continue?').should('be.visible');

        cy.log('Continuing opens the publication engine on the languages that can be published');
        cy.contains('button', 'Yes').click();
        // The engine itself is the proof that publication proceeded. An editor holds no publication
        // permission, so it offers the workflow route — `Request publication`, never `Publish now`.
        cy.get('#JahiaGxtEngineCards', {timeout: 60000}).should('be.visible');
        cy.get('#JahiaGxtEngineCards .x-grid3-row').should('have.length.greaterThan', 0);
        cy.contains('button', 'Request publication').should('be.visible');
    });
});
