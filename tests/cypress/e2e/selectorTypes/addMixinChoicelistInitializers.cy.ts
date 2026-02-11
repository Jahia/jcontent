import {JContent, PageComposer} from '../../page-object/';
import {getComponentByRole} from '@jahia/cypress';
import {Picker} from '../../page-object/picker';

const sitekey = 'contentEditorSiteAddMixin';
const fieldOffset = {top: -200, left: 0};
describe.skip('Add Mixin by using choice list initializers (Image Reference)', () => {
    let pageComposer: PageComposer;
    const cypressDocumentManagerImageReferenceLinkTest = 'Cypress document manager image reference link Test';
    before(function () {
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: sitekey});
        cy.loginAndStoreSession(); // Edit in chief
        JContent.visit(sitekey, 'en', 'media/file');
        cy.get('div[data-cm-role="grid-content-list"]')
            .should('be.visible')
            .children('div')
            .selectFile('cypress/fixtures/contentEditor/snowbearHome.jpeg', {
                action: 'drag-drop',
                waitForAnimations: true
            });
        cy.get('[data-sel-role-card="snowbearhome.jpeg"]').should('be.visible');
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        pageComposer = PageComposer.visit(sitekey, 'en', 'home.html');
    });

    it('Can create a document manager image reference link', () => {
        const contentEditor = pageComposer
            .openCreateContent()
            .getContentTypeSelector()
            .searchForContentType('jnt:imageReferenceLink')
            .selectContentType('jnt:imageReferenceLink')
            .create();
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Create Image (Internationalized)');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="internal"]')
            .click();

        const selector = '[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]';
        cy.get(selector).scrollIntoView({offset: fieldOffset});
        contentEditor.getLanguageSwitcher().select('French');
        cy.get(selector).as('fr_internal_link').scrollIntoView({offset: fieldOffset});
        cy.get(selector).should('be.visible');

        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="external"]')
            .click();
        cy.get('@fr_internal_link').should('not.exist');
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:linkTitle"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:linkTitle"]').should('be.visible');
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:url"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:url"]').should('be.visible');
        contentEditor.getLanguageSwitcher().select('German');
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').should('not.exist');
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:linkTitle"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:linkTitle"]').should('be.visible');
        cy.get('[data-sel-content-editor-field="jmix\\:externalLink_j\\:url"]')
            .as('de_external_link_url')
            .scrollIntoView({offset: fieldOffset});
        cy.get('@de_external_link_url').should('be.visible');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="none"]')
            .click();
        cy.get('@de_external_link_url').should('not.exist');
        contentEditor.getLanguageSwitcher().select('English');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').contains('No link');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="internal"]')
            .click();
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]')
            .click();
        cy.get('.moonstone-loader').should('not.exist'); // Wait to load
        const picker = getComponentByRole(Picker, 'picker-dialog');
        picker.selectTab('pages');
        cy.get('.moonstone-loader').should('not.exist'); // Wait to load
        cy.get('tr[data-cm-role="table-content-list-row"]').contains('Search Results').click();
        cy.get('button[data-sel-picker-dialog-action="done"]').click();
        cy.get('[data-sel-content-editor-field="jnt\\:imageReferenceLink_jcr\\:title"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jnt\\:imageReferenceLink_jcr\\:title"]')
            .should('be.visible')
            .type(cypressDocumentManagerImageReferenceLinkTest);
        cy.get('[data-sel-content-editor-field="jnt\\:imageReferenceLink_j\\:node"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jnt\\:imageReferenceLink_j\\:node"]')
            .should('be.visible')
            .click();
        cy.get('[data-sel-role-card="snowbearhome.jpeg"]').should('be.visible').contains('snowbearhome.jpeg').click();
        cy.get('button[data-sel-picker-dialog-action="done"]').click();
        contentEditor.create();
        pageComposer
            .refresh()
            .componentShouldBeVisible(
                `a[href*="/sites/${sitekey}/home/search-results.html"] > img[src*="/sites/${sitekey}/files/snowbearhome.jpeg"]`
            );
    });

    it('Can edit a document manager image reference link', () => {
        const contentEditor = pageComposer.editComponent(
            `a[href*="/sites/${sitekey}/home/search-results.html"] > img[src*="/sites/${sitekey}/files/snowbearhome.jpeg"]`
        );
        cy.get('#contenteditor-dialog-title')
            .should('be.visible')
            .and('contain', 'Cypress document manager image reference');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="none"]')
            .click();
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').should('not.exist');
        contentEditor.getLanguageSwitcher().select('French');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').contains('Pas de lien');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').click();
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType')
            .find('li[role="option"][data-value="internal"]')
            .click();
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').should('be.visible');
        contentEditor.getLanguageSwitcher().select('English');
        cy.get('#select-jnt\\:imageReferenceLink_j\\:linkType').contains('Internal');
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]')
            .should('exist')
            .scrollIntoView({offset: fieldOffset});
        cy.get('[data-sel-content-editor-field="jmix\\:internalLink_j\\:linknode"]').should('be.visible');
        // ContentEditor.cancelAndDiscard()
        contentEditor.cancel();
    });
});
