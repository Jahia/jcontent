import {ContentEditor, JContent} from '../../page-object';
import {deleteSite, enableModule} from '@jahia/cypress';

// https://github.com/Jahia/jcontent/issues/2168
describe.skip('Work in Progress tests', () => {
    let jcontent: JContent;
    const siteKey1 = 'wipSite1lang';
    const siteKey3 = 'wipSite3lang';

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: 'wipSite1lang'});
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: 'wipSite3lang'});
        cy.apollo({mutationFile: 'contentEditor/createContent/createContentForWIP.graphql'});
        enableModule('qa-module', siteKey3);
    });

    after(function () {
        deleteSite(siteKey1);
        deleteSite(siteKey3);
        cy.logout();
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Can create work in progress content on single language site', function () {
        jcontent = JContent.visit(siteKey1, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('jnt:bigText');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode();

        const contentSection = contentEditor.openSection('content');

        contentEditor.openSection('options').get().find('input[type="text"]').clear().type('cypress-wip-test');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Work In Progress Test');
        // Check the WIP badge is displayed
        cy.get('div[data-sel-role="wip-info-chip"]', {timeout: 5000}).should('exist');
        contentEditor.create();

        // Check the WIP icon is displayed in jcontent
        cy.contains('[data-cm-role="table-content-list-row"]', 'Cypress Work In Progress Test')
            .find('.moonstone-chip')
            .should('have.attr', 'title')
            .and('contain', 'Work in progress');
    });

    it('Can create work in progress content for en/fr properties', function () {
        jcontent = JContent.visit(siteKey3, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('jnt:bigText');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode('en,fr');
        const contentSection = contentEditor.openSection('content');
        contentEditor.openSection('options').get().find('input[type="text"]').clear().type('cypress-wip-en_fr-test');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').type('Cypress Work In Progress EN/FR Test');
        // Switch to French
        contentEditor.getLanguageSwitcher().select('French');
        // Check the WIP badge is displayed in French
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 1000}).should('contain', 'WIP - FR');
        cy.focused().frameLoaded('iframe.cke_wysiwyg_frame');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Work In Progress FR/EN Test');
        contentEditor.create();
        jcontent.getTable().getRowByName('cypress-wip-en_fr-test');
        jcontent.getLanguageSwitcher().select('fr');
        jcontent.getTable().getRowByName('cypress-wip-en_fr-test');
    });

    it('Can set work in progress - all languages all properties', function () {
        jcontent = JContent.visit(siteKey3, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('wip simple text');
        const contentEditor = new ContentEditor();
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode('ALL');
        // Switch to French
        contentEditor.getLanguageSwitcher().select('French');
        // Check the WIP badge is displayed in French
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 5000}).should('contain', 'Work in progress');
        // Switch to German
        contentEditor.getLanguageSwitcher().select('German');
        // Check the WIP badge is displayed in German
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 5000}).should('contain', 'Work in progress');
        contentEditor.save();
    });

    it('Can deactivate work in progress in all languages', function () {
        jcontent = JContent.visit(siteKey1, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('wip text 1');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        // Deactivate Work in progress
        contentEditor.deactivateWorkInProgressMode();
        // Check that WIP badge is not displayed anymore
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 1000}).should('not.exist');
        contentEditor.cancelAndDiscard();
    });

    it('Can deactivate work in progress in only one language', function () {
        jcontent = JContent.visit(siteKey3, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('wip text 2');
        const contentEditor = new ContentEditor();
        // Deactivate Work in progress in English
        contentEditor.deactivateWorkInProgressMode('en');
        // Check the WIP badge is not displayed in English
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 3000}).should('not.exist');
        // Switch to French
        contentEditor.getLanguageSwitcher().select('French');
        // Check that WIP badge is displayed
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 3000}).should('contain', 'WIP - FR');
        contentEditor.cancelAndDiscard();
    });

    it('Can set work in progress on fields', function () {
        jcontent = JContent.visit(siteKey3, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('all-fields-test');
        const contentEditor = new ContentEditor();
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode('en');
        // Verify wip badge for field smallText
        cy.get('[data-sel-content-editor-field="qant:allFields_smallText"]')
            .find('[data-sel-role="wip-info-chip-field"]')
            .should('exist');
        // Verify wip badge is NOT displayed for field sharedSmallText
        cy.get('[data-sel-content-editor-field="qant:allFields_sharedSmallText"]')
            .find('[data-sel-role="wip-info-chip-field"]')
            .should('not.exist');
        // Switch to French and verify wip badge is not displayed anywhere
        contentEditor.getLanguageSwitcher().select('French');
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 1000}).should('not.exist');
        cy.get('[data-sel-content-editor-field="qant:allFields_smallText"]')
            .find('[data-sel-role="wip-info-chip-field"]')
            .should('not.exist');
        cy.get('[data-sel-content-editor-field="qant:allFields_sharedSmallText"]')
            .find('[data-sel-role="wip-info-chip-field"]')
            .should('not.exist');
        contentEditor.cancelAndDiscard();
    });

    it('Can copy paste content set as WIP', function () {
        jcontent = JContent.visit(siteKey1, 'en', 'content-folders/contents');
        // Verify WIP badge
        jcontent.getTable().getRowByName('Copy paste WIP test').get().find('.moonstone-chip[title="Work in progress: en (excluding non-localized properties)"]');
        jcontent.getTable().getRowByName('Copy paste WIP test').contextMenu().select('Copy');
        jcontent.getAccordionItem('content-folders').click();
        jcontent.getAccordionItem('content-folders').getTreeItem('wipFolder').click();
        jcontent.getHeaderActionButton('paste').click();
        // Verify WIP badge
        jcontent.getTable().getRowByName('Copy paste WIP test').get().find('.moonstone-chip[title="Work in progress: en (excluding non-localized properties)"]');
    });

    it('Checks on publication button on WIP content', function () {
        jcontent = JContent.visit(siteKey3, 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('wip text for publish button');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.activateWorkInProgressMode('ALL');
        contentEditor.save();
        // Check that publication button is disabled
        contentEditor.checkButtonStatus('publishAction', false);

        // Deactivate Work in progress
        contentEditor.deactivateWorkInProgressMode('ALL');
        contentEditor.save();
        // Check that publication button is enabled
        contentEditor.checkButtonStatus('publishAction', true);

        // Activate Work in progress in English
        contentEditor.activateWorkInProgressMode('en');
        contentEditor.save();
        // Check that publication button is disabled in English
        contentEditor.checkButtonStatus('publishAction', false);
        // Check it is enabled in French
        contentEditor.getLanguageSwitcherAdvancedMode().select('French');
        contentEditor.checkButtonStatus('publishAction', true);

        contentEditor.cancel();
    });

    it('Set WIP on a content and publish the page', function () {
        jcontent = JContent.visit(siteKey1, 'en', 'pages/home/wip-page')
            .switchToListMode();
        jcontent.editComponentByRowName('WIP content on page');

        // Activate WIP
        const contentEditor = new ContentEditor();
        contentEditor.activateWorkInProgressMode();
        contentEditor.save();

        // Verify WIP status is displayed on simple-text
        jcontent.getTable().getRowByName('WIP content on page').get().find('.moonstone-chip[title="Work in progress: All Content (localised & non localised properties)"]');

        // Publish the page
        cy.get('.moonstone-header_mainActions [data-sel-role="publish"]').click();
        jcontent.clickPublishNow();
        // Wait for the publication then verify the status
        cy.get('.moonstone-header_information', {timeout: 5000})
            .contains('Published')
            .should('be.visible');

        // Verify simple-text is not published
        jcontent.getTable().getRowByName('WIP content on page')
            .should('contain.text', 'This content has never been published');
        // Verify WIP status is still displayed on simple-text
        jcontent.getTable().getRowByName('WIP content on page').get().find('.moonstone-chip[title="Work in progress: All Content (localised & non localised properties)"]');
    });
});
