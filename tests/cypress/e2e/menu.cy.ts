import {JContent} from '../page-object';
import {Button, getComponentByRole, getComponentBySelector, Menu} from '@jahia/cypress';
import {ContentEditor} from '@jahia/content-editor-cypress/dist/page-object';
import {Field} from '@jahia/content-editor-cypress/dist/page-object/fields';

describe('Menu tests', () => {
    beforeEach(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.loginEditor(); // Edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Can edit content', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.getTable().getRowByIndex(1).contextMenu().select('Delete');

        cy.get('[data-sel-role="cancel-button"]').click();
    });

    it('Can download file', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByIndex(1).contextMenu().select('Download');
        cy.window().then(win => {
            console.log(win);
        });
        getComponentByRole(Button, 'download-cancel').click();
    });

    it('Can create a page at same level as home', () => {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        const navAccordion = jcontent.getSecondaryNavAccordion();
        navAccordion.click('pages');
        navAccordion.getContent().get('div[data-cm-role="rootpath-context-menu-holder"]').rightclick('top', {scrollBehavior: 'top'});
        getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)').selectByRole('jnt:page');
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jnt:page_jcr:title').get().find('input[type="text"]').should('be.visible')
            .clear({force: true}).type('New Root Level Page', {force: true})
            .should('have.value', 'New Root Level Page');
        const templateField = contentEditor.getField(Field, 'jnt:page_j:templateName');
        templateField.get().click();
        getComponentBySelector(Menu, '[role="listbox"]').select('3 Column');
        contentEditor.save();
        navAccordion.click('pages').getContent().find('[role="tree"]').find('[data-sel-role="new-root-level-page"]').should('be.visible').click();
    });
});
