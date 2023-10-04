import {Button, getComponentByRole} from '@jahia/cypress';
import {PageComposer} from '../../page-object/pageComposer';
import {JContent} from "../../page-object";

describe('Create content tests', {retries: 10}, () => {
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: 'contentEditorSite'});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: 'contentEditorSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
    });

    it('Can create content', function () {
        const contentEditor = jcontent.createContent('Rich text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        const contentSection = contentEditor.openSection('Content');
        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('cypress-test');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Test');
        contentEditor.create();
        jcontent.getTable().getRowByLabel('Cypress Test');
    });

    it('Can create multiple content in same modal', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('Rich text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        let contentSection = contentEditor.openSection('Content');
        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('cypress-test-multiple-1');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Multiple Content Test 1');
        contentEditor.addAnotherContent();
        contentEditor.create();
        contentEditor.closeSection('Content');
        contentEditor
            .openSection('Options')
            .get()
            .find('input[type="text"]')
            .should('have.value', 'rich-text')
            .clear()
            .type('cypress-test-multiple-2');
        contentSection = contentEditor.openSection('Content');
        // CKEditor will stay in source mode so no need to click on source again
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Multiple Content Test 2');
        contentEditor.removeAnotherContent();
        contentEditor.create();
        jcontent.getTable().getRowByLabel('Cypress Multiple Content Test 1');
        jcontent.getTable().getRowByLabel('Cypress Multiple Content Test 2');
    });

    it('Can create work in progress content', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('Rich text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode();
        const contentSection = contentEditor.openSection('Content');
        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('cypress-wip-test');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Work In Progress Test');
        contentEditor.create();
        jcontent.getTable().getRowByLabel('Cypress Work In Progress Test');
        // pageComposer.shouldContainWIPOverlay();
    });

    // it ('can create and delete wip', function () {
    //     jc
    // });

    it('Can create a news and edit it from the successful alert', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('News entry');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create News entry');
        const contentSection = contentEditor.openSection('Content');
        contentSection.get().find('#jnt\\:news_jcr\\:title').clear({force: true}).type('Cypress news titlez', {force: true});
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').type('Cypress news content');
        contentEditor.create();
        contentEditor.editSavedContent();
        contentSection
            .get()
            .find('#jnt\\:news_jcr\\:title')
            .should('have.value', 'Cypress news titlez')
            .clear({force: true})
            .type('Cypress news title', {force: true});
        getComponentByRole(Button, 'submitSave').click();
        // GetComponentByRole(Button, 'backButton').click()
        jcontent.getTable().getRowByLabel('Cypress news title');
    });

    it('keeps "create another" checkbox state after save', () => {
        const contentEditor = jcontent.createContent('Simple text');
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Create Simple text');

        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('create-another-1');
        contentEditor.closeSection('Options');
        contentEditor.openSection('Content').get().find('input[name="jnt:text_text"]')
            .type('Create another - test 1');
        contentEditor.addAnotherContent();
        contentEditor.create();

        cy.get('#createAnother').should('have.attr', 'aria-checked', 'true');
        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('create-another-2');
        contentEditor.openSection('Content').get().find('input[type="text"]').type('Create another - test 2');
        contentEditor.removeAnotherContent();
        contentEditor.create();
        jcontent.getTable().getRowByLabel('Create another - test 1');
        jcontent.getTable().getRowByLabel('Create another - test 2');
    });
});
