// Migrated from the legacy Selenium class StartAllWorkflowsTest (Jahia/selenium#1600), FT-001.
//
// The dialog is raised by core, not by jContent: PublicationWorkflow opens a GXT confirm box when a
// publish-all covers both publishable and unpublishable nodes. So the site needs a language the page
// was never translated into — without `es` here the dialog never appears and the test is vacuous.

import {addNode, context, createSite, createUser, deleteUser, grantRoles} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const siteKey = 'publishAllWarningSite';
const pageName = 'wkfpage';
const editor = {username: 'publishAllWarningEditor', password: 'password'};

// Both scripts are guarded — deleteSite.groovy checks the site exists, and @jahia/cypress'
// deleteUser.groovy checks the user does — so this runs as a defensive pre-clean too, ahead of a
// previous run whose own teardown failed.
const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

describe('Publish all in all languages, with content untranslated in one of them', () => {
    before(() => {
        removeFixtures();

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
        removeFixtures();
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
