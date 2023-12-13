import {ContentEditor, JContent} from '../../page-object';

const sitekey = 'jcontentSite';
describe('Create content tests', () => {
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: sitekey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    afterEach(() => {
        cy.logout();
    });

    it('Display visibility screen in non i18n site', () => {
        jcontent = JContent.visit(sitekey, 'en', 'pages/home');
        jcontent.switchToListMode().getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:i18n"]').should('not.exist');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:conditionalVisibility"]').should('be.visible');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:channelSelection"]').should('be.visible');
        contentEditor.cancel();
    });

    it('Activate date and time -  no rules set', () => {
        jcontent = JContent.visit(sitekey, 'en', 'pages/home');
        jcontent.switchToListMode().getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:conditionalVisibility"]').should('be.visible').click();
        cy.get('[data-cm-role="visibilityScreen"]').contains('No rules set');
        contentEditor.cancel();
    });

    it('Activate date and time - 2 rules set', () => {
        cy.apollo({mutationFile: 'contentEditor/visibility/createRules.graphql'});
        jcontent = JContent.visit(sitekey, 'en', 'pages/home');
        jcontent.switchToListMode().getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:conditionalVisibility"]').find('input').should('be.checked');
        cy.get('[data-cm-role="visibilityScreen"]').contains('2 rules set');
        contentEditor.cancel();
    });

    it('Add languages to site - languages checkboxes should show', () => {
        cy.apollo({mutationFile: 'contentEditor/visibility/addLanguagesToSite.graphql'});
        jcontent = JContent.visit(sitekey, 'en', 'pages/home');
        jcontent.switchToListMode().getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        let contentEditor = new ContentEditor();
        let advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:i18n"]').should('be.visible').click();
        cy.get('input[name="jmix:i18n_j:invalidLanguages"]').should('have.length', 3).and('be.checked').uncheck('fr');
        contentEditor.save();
        contentEditor.cancel();
        jcontent.getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        contentEditor = new ContentEditor();
        advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('input[value="fr"]').should('have.length', 1).and('not.be.checked').check();
        contentEditor.save();
        contentEditor.cancel();
    });

    it('Add languages to site - languages switch should show', () => {
        cy.apollo({mutationFile: 'contentEditor/visibility/addExtraLanguagesToSite.graphql'});
        jcontent = JContent.visit(sitekey, 'en', 'pages/home');
        jcontent.switchToListMode().getTable().getRowByLabel('test 1').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        const advancedOptions = contentEditor.switchToAdvancedOptions();
        advancedOptions.switchToOption('Visibility');
        cy.get('[data-sel-role-dynamic-fieldset="jmix:i18n"]').should('be.visible').click();
        cy.get('.moonstone-listSelector').contains('The content will be visible in:').should('be.visible');
        cy.get('li.moonstone-valueListItem[role="left-list"]').should('have.length', 7);
        contentEditor.cancel();
    });
});
