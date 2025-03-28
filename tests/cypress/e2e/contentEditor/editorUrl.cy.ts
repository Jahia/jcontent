import {ContentEditor, JContent, PageComposer} from '../../page-object';
import {Button, getComponentByRole} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('Editor url test', () => {
    let jcontent: JContent;
    let contentEditor: ContentEditor;
    let validUuid;

    before(() => {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        getValidUuid();
    });

    function getValidUuid() {
        cy.apollo({
            mutation: gql`
                query getUuid {
                    jcr {
                        nodeByPath(path: "/sites/digitall/home/about/area-main/rich-text") { uuid }
                    }
                }
            `
        }).then(resp => {
            validUuid = resp?.data?.jcr?.nodeByPath?.uuid;
        });
    }

    it('should open editor', function () {
        cy.login();
        jcontent = JContent.visit('digitall', 'en', 'pages/home');
        jcontent.switchToListMode();
        contentEditor = jcontent.editComponentByText('People First');
        contentEditor.switchToAdvancedMode();
    });

    it('Should open editor upon login', function () {
        ContentEditor.getUrl('/sites/digitall/home/area-main/highlights/people-first', 'digitall', 'en', 'pages/home')
            .then(url => {
                cy.visit(url, {failOnStatusCode: false});
            });
        cy.get('input[name="username"]').type('root', {force: true});
        cy.get('input[name="password"]').type('root1234', {force: true});
        cy.get('button[type="submit"]').click({force: true});
        cy.get('h1').contains('People First').should('exist');
        contentEditor = ContentEditor.getContentEditor();
        contentEditor.cancel();
        jcontent.switchToListMode();
        cy.get('span').contains('People First').should('exist');
    });

    it('Should open editor already logged in', function () {
        cy.login();
        contentEditor = ContentEditor.visit('/sites/digitall/home/area-main/highlights/people-first', 'digitall', 'en', 'pages/home');
        cy.get('h1').contains('People First').should('exist');
        contentEditor.cancel();
        jcontent.switchToListMode();
        cy.get('span').contains('People First').should('exist');
    });

    it('Should create hash', function () {
        cy.login();
        jcontent = JContent.visit('digitall', 'en', 'pages/home');
        jcontent.switchToListMode();
        contentEditor = jcontent.editComponentByText('People First');
        contentEditor.switchToAdvancedMode();
        cy.hash().should('contain', 'contentEditor:');
        cy.hash().should('contain', 'lang:en');
    });

    it.skip('History is handled consistently', {retries: 3}, function () {
        cy.login();
        jcontent = JContent.visit('digitall', 'en', 'pages/home');
        jcontent.switchToListMode();

        cy.log('Editing People First');
        contentEditor = jcontent.editComponentByText('People First');
        cy.log('Switching to advanced mode');
        contentEditor.switchToAdvancedMode();
        cy.log('Checking if the component is open');
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');

        cy.log('Going back to homepage');
        cy.go('back');
        jcontent.getTable().getRowByLabel('How to Use This Demo').get().should('be.visible');

        cy.log('Going forward to People First CE');
        cy.go('forward');
        contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');

        cy.log('Cancel editing People First');
        contentEditor.cancel();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('not.contain', 'contentEditor');
        jcontent.getTable().getRowByLabel('How to Use This Demo').get().should('be.visible');

        cy.log('Reopen People First by going forward');
        cy.go('forward');
        cy.url().should('contain', 'contentEditor');
        contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');
        cy.get('h1').contains('People First').should('exist');
        contentEditor.cancel();

        cy.log('Back to Home page list');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('not.contain', 'contentEditor');
        jcontent.getTable().getRowByLabel('How to Use This Demo').get().should('be.visible');

        cy.log('Edit Our Companies');
        contentEditor = jcontent.editComponentByText('Our Companies');
        contentEditor.switchToAdvancedMode();
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');
        cy.go('back');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('not.contain', 'contentEditor');
        jcontent.getTable().getRowByLabel('How to Use This Demo').get().should('be.visible');

        cy.go('forward');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('contain', 'contentEditor');
        contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');
        contentEditor.cancel();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('not.contain', 'contentEditor');
        jcontent.getTable().getRowByLabel('How to Use This Demo').get().should('be.visible');
        cy.go('forward');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.url().should('contain', 'contentEditor');
        contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('jdnt:highlight_description', false).should('be.visible');
        contentEditor.cancel();
    });

    it('Handles breadcrumb in GWT correctly', function () {
        cy.login();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        ContentEditor.getUrl('/sites/digitall/home/area-main/highlights/people-first', 'digitall', 'en', 'pages/home')
            .then(url => {
                const hash = url.substring(url.indexOf('#'));
                cy.login();
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(3000);
                PageComposer.visit('digitall', 'en', `home.html?redirect=false${hash}`);
                cy.url().should('contain', hash).and('contain', '/jahia/page-composer/default/');
                contentEditor = new ContentEditor();
                contentEditor.getBreadcrumb('highlights').click();
                cy.get('h1').contains('highlights').should('exist');
                jcontent = new JContent();
                jcontent.getTable().getRowByLabel('People First').get().should('be.visible');
            });
        cy.logout();
    });

    it('Should not show error modal for valid uuid', () => {
        cy.loginAndStoreSession('irina', 'password');
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${validUuid}')))`;
        JContent.visit('digitall', 'en', 'pages/home');
        cy.visit(`${baseUrl}#${ceParams}`);
        cy.get('[data-sel-role="ce-error-dialog"]')
            .should('not.exist', {timeout: 10000});
        cy.get('[data-sel-mode="edit"]').should('be.visible');
    });

    it('Should show error modal for opening CE url for invalid UUID', () => {
        cy.login();
        const uuid = 'invalidUuid';
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${uuid}')))`;
        cy.visit(`${baseUrl}#${ceParams}`);
        cy.get('[data-sel-role="ce-error-dialog"]')
            .should('be.visible')
            .and('contain', 'Content Editor could not be opened');
        getComponentByRole(Button, 'close-button').click();
        cy.get('.moonstone-header h1').contains('About').should('be.visible');
    });

    it('should break all inheritance for node', () => {
        cy.login();
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${validUuid}')))`;
        cy.visit(`${baseUrl}#${ceParams}`);
        jcontent = new JContent();
        jcontent.getHeaderActionButton('tab-advanced-options').click();
        jcontent.assertHeaderActionSelected('tab-advanced-options');
        cy.get('[data-sel-role="advanced-options-nav"] li')
            .contains('Edit roles')
            .click();
        cy.get('#JahiaGxtEditEngineTabs button').contains('Break all inheritance').click();
        cy.get('button.x-btn-text').contains('Save').click();
    });

    it('Should show error modal for opening CE url for user with no permission', () => {
        cy.loginAndStoreSession('irina', 'password');
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${validUuid}')))`;
        JContent.visit('digitall', 'en', 'pages/home');
        cy.visit(`${baseUrl}#${ceParams}`);
        cy.get('[data-sel-role="ce-error-dialog"]')
            .should('be.visible')
            .and('contain', 'Content Editor could not be opened');
        getComponentByRole(Button, 'close-button').click();
        cy.get('.moonstone-header h1').contains('About').should('be.visible');
    });

    it('Should restore all inheritance for node', () => {
        cy.login();
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        const ceParams = `(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${validUuid}')))`;
        cy.visit(`${baseUrl}#${ceParams}`);
        jcontent = new JContent();
        jcontent.getHeaderActionButton('tab-advanced-options').click();
        jcontent.assertHeaderActionSelected('tab-advanced-options');
        cy.get('[data-sel-role="advanced-options-nav"] li')
            .contains('Edit roles')
            .click();
        cy.get('#JahiaGxtEditEngineTabs button').contains('Restore all inheritance').click();
        cy.get('button.x-btn-text').contains('Save').click();
    });

    it('Should show error modal for opening CE url for missing/invalid params', () => {
        cy.login();
        const baseUrl = '/jahia/jcontent/digitall/en/pages/home/about';
        // Missing end parens
        const ceParams = `(contentEditor:!((formKey:modal_0,lang:en,mode:edit,site:digitall,uilang:en,uuid:'${validUuid}')`;
        cy.visit(`${baseUrl}#${ceParams}`);
        cy.get('[data-sel-role="ce-error-dialog"]')
            .should('be.visible')
            .and('contain', 'Content Editor could not be opened');
        getComponentByRole(Button, 'close-button').click();
        cy.get('.moonstone-header h1').contains('About').should('be.visible');
    });
});
