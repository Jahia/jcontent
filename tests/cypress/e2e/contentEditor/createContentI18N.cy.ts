import {JContent} from '../../page-object/jcontent';

const sitekey = 'contentEditorSiteI18N';
describe('Create content tests in I18N site', () => {
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: sitekey});
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/contents');
    });

    it('Can create work in progress content for en/fr properties', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('Rich text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Rich text');
        // Activate Work in progress
        contentEditor.activateWorkInProgressMode('en,fr');
        const contentSection = contentEditor.openSection('Content');
        contentEditor.openSection('Options').get().find('input[type="text"]').clear().type('cypress-wip-en_fr-test');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').type('Cypress Work In Progress EN/FR Test');
        // Switch to French
        contentEditor.getLanguageSwitcher().select('Français');
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 1000}).should('contain', 'WIP - FR');
        cy.focused().frameLoaded('iframe.cke_wysiwyg_frame');
        contentSection.expand().get().find('.cke_button__source').click();
        contentSection.get().find('textarea').should('have.value', '').type('Cypress Work In Progress FR/EN Test');
        contentEditor.create();
        jcontent.getTable().getRowByLabel('Cypress Work In Progress EN/FR Test');
        jcontent.getLanguageSwitcher().select('fr');
        jcontent.getTable().getRowByLabel('Cypress Work In Progress FR/EN Test');
    });

    it('keeps "create another" checkbox state when switching languages ', () => {
        const contentEditor = jcontent.createContent('Rich text');
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Create Rich text');

        contentEditor.getLanguageSwitcher().selectLang('English');
        contentEditor.addAnotherContent();
        contentEditor.getLanguageSwitcher().selectLang('Français');
        cy.get('#createAnother').should('have.attr', 'aria-checked', 'true');

        contentEditor.cancel();
    });

    it('Can create a news in en -> fr and then create a new one in en only ', {retries: 0}, function () {
        const contentEditor = jcontent.createContent('News entry');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create News entry');
        const contentSection = contentEditor.openSection('Content');
        contentSection.get().find('#jnt\\:news_jcr\\:title').clear({force: true}).type('Cypress news title', {force: true});
        contentEditor.getRichTextField('jnt:news_desc').type('Cypress news content');
        contentSection.get().find('#jnt\\:news_jcr\\:title').focus().click({force: true});
        // Switch to French
        contentEditor.getLanguageSwitcher().select('Français');
        contentEditor.addAnotherContent();
        contentSection.get().find('#jnt\\:news_jcr\\:title').clear({force: true}).type('Cypress titre actualite', {force: true});
        contentEditor.getRichTextField('jnt:news_desc').type('Cypress contenu actualite');
        contentSection.get().find('#jnt\\:news_jcr\\:title').focus().click({force: true});
        contentEditor.create();
        contentSection.get().find('#jnt\\:news_jcr\\:title').click({force: true}).focus();
        contentEditor.getLanguageSwitcher().select('English');
        cy.get('#contenteditor-dialog-content').should('not.contain.text', 'Invalid form');
        contentSection.get().find('#jnt\\:news_jcr\\:title').clear({force: true}).type('Cypress news title 2', {force: true});
        contentEditor.getRichTextField('jnt:news_desc').type('Cypress news content 2');
        contentSection.get().find('#jnt\\:news_jcr\\:title').focus().click({force: true});
        contentEditor.create();
        contentEditor.getLanguageSwitcher().select('Français');
        cy.get('#contenteditor-dialog-content', {timeout: 1000}).should('not.contain.text', 'Invalid form');
        contentSection.get().find('#jnt\\:news_jcr\\:title').clear({force: true}).type('Cypress titre actualite 3', {force: true});
        contentEditor.create();
        contentEditor.cancelAndDiscard();
        jcontent.getTable().getRowByLabel('Cypress news title');
        jcontent.getTable().getRowByLabel('Cypress news title 2');
    });

    it('Correctly handles i18n title with jcr:title property on the node itself', function () {
        jcontent = JContent.visit(sitekey, 'en', 'media/file');
        const fileName = 'snowbearHome.jpeg';
        const fieldName = 'jnt:file_jcr:title';
        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.get('div[data-cm-role="grid-content-list"]')
            .children('div')
            .selectFile(`cypress/fixtures/contentEditor/${fileName}`, {
                action: 'drag-drop',
                waitForAnimations: true
            }).then(() => {
                // Unfortunately, this one seems necessary as it takes some time for uploaded file to register in JCR
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000);
                cy.apollo({mutationFile: 'contentEditor/createContent/addJcrTitleWithLang.graphql', variables: {
                    path: `/sites/${sitekey}/files/${fileName}`,
                    value: 'No lang'
                }});

                cy.apollo({mutationFile: 'contentEditor/createContent/addJcrTitleWithLang.graphql', variables: {
                    path: `/sites/${sitekey}/files/${fileName}`,
                    value: 'With lang',
                    lang: 'en'
                }});

                jcontent.switchToListMode();
                let contentEditor = jcontent.editComponentByText(fileName);
                contentEditor.getSmallTextField(fieldName).checkValue('With lang');
                contentEditor.getSmallTextField(fieldName).addNewValue('New value', true);
                contentEditor.save();
                contentEditor = jcontent.editComponentByText(fileName);
                contentEditor.getSmallTextField(fieldName).checkValue('New value');
            });
    });
});
