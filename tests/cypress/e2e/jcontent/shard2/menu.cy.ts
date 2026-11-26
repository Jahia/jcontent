import {JContent} from '../../../page-object';
import {Button, getComponentByRole, getComponentBySelector, Menu} from '@jahia/cypress';
import {ContentEditor} from '../../../page-object/contentEditor';
import {Field} from '../../../page-object/fields';

describe('Menu tests', () => {
    beforeEach(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.loginAndStoreSession(); // Edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Can edit content', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('test-content1').contextMenu().select('Delete');

        cy.get('[data-sel-role="cancel-button"]').click();
    });

    it('Can download file', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('bootstrap.css').contextMenu().select('Download');
        cy.window().then(win => {
            console.log(win);
        });
        getComponentByRole(Button, 'download-cancel').click();
    });

    it('Can create a page at same level as home', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        const navAccordion = jcontent.getSecondaryNavAccordion();
        navAccordion.click('pages');
        navAccordion.getContent().get('div[data-cm-role="navtree-holder"]').rightclick('bottom');
        // There's a bug in selectByRole that needs to be fixed
        // then revert back to helper function; temp fix to revert when released. https://github.com/Jahia/jahia-cypress/pull/125/files
        // getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)').selectByRole('jnt:page');
        getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)')
            .get().find('.moonstone-menuItem[data-sel-role="jnt:page"]').trigger('click');
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jnt:page_jcr:title').get().find('input[type="text"]').should('be.visible')
            .clear({force: true}).type('New Root Level Page', {force: true})
            .should('have.value', 'New Root Level Page');
        const templateField = contentEditor.getField(Field, 'jmix:hasTemplateNode_j:templateName');
        templateField.get().click();
        getComponentBySelector(Menu, '[role="list"]').select('3 Column');
        contentEditor.create();
        navAccordion.click('pages').getContent().find('[role="tree"]').find('[data-sel-role="new-root-level-page"]').should('be.visible').click();
    });

    it('Raises no error when the empty part of the content panel is right-clicked', () => {
        // Uncaught exceptions are answered with false for every spec in support/e2e.js, so a
        // thrown error cannot fail a test on its own. This listener records them instead,
        // which is what lets this test assert on something the suite otherwise swallows.
        const onUncaughtError = cy.spy().as('uncaughtError');
        cy.on('uncaught:exception', error => {
            onUncaughtError(error);
            return false;
        });

        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();

        // The panel itself, not a row: a row stops the event propagating and opens its own
        // menu, so only a click that reaches the panel exercises what this covers.
        cy.get('[data-cm-role="content-area"]').rightclick('bottomRight');

        cy.get('@uncaughtError').should('not.have.been.called');
    });
});
