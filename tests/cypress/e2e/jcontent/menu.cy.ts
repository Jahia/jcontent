import {JContent} from '../../page-object';
import {Button, getComponentByRole, getComponentBySelector, Menu} from '@jahia/cypress';
import {ContentEditor} from '../../page-object/contentEditor';
import {Field} from '../../page-object/fields';

describe('Menu tests', () => {
    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.apollo({mutationFile: 'jcontent/enablePageBuilder.graphql'});
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Can edit content', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
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

    it('Checks actions inside contextual menu of a folder', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files');
        jcontent.switchToListMode();

        const contextMenu = jcontent
            .getTable()
            .getRowByName('bootstrap')
            .contextMenu();

        const items = [
            'Rename',
            'New folder',
            'Copy',
            'Upload file(s)',
            'Lock',
            'Download as zip'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });

    it('Checks actions inside contextual menu of a file', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();

        const contextMenu = jcontent
            .getTable()
            .getRowByName('bootstrap.css')
            .contextMenu();

        const item = [
            'Edit',
            'Rename',
            'Download',
            'Replace with',
            'Preview',
            'Cut'
        ];

        item.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });

    it('Checks actions inside contextual menu of a page', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        const contextMenu = jcontent
            .getTable()
            .getRowByName('search-results')
            .contextMenu();

        const items = [
            'Edit',
            'Export',
            'Import content',
            'Cut',
            'Show in Repository Explorer'
        ];

        items.forEach(item => {
            contextMenu.shouldHaveItem(item);
        });
    });
});
