import {JContent} from '../../page-object/';
import {enableModule} from '@jahia/cypress';

const sitekey = 'contentEditorSiteAddMixin';
const fieldOffset = {top: -200, left: 0};
describe('Add Mixin by using choice list initializers (Image Reference)', () => {
    let jcontent: JContent;
    const cypressDocumentManagerImageReferenceLinkTest = 'Cypress document manager image reference link Test';
    before(function () {
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
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/content');
    });

    it('Can create and edit a document manager image reference link', () => {
        let contentEditor = jcontent.createContent('jnt:imageReferenceLink');
        let linkTypeField = contentEditor.getChoiceListField('jnt:imageReferenceLink_j:linkType');
        const internalLinkField = contentEditor.getPickerField('jnt:imageReferenceLink_j:node');

        contentEditor.getTitle().should('be.visible').and('contain', 'Create Image (Internationalized)');
        linkTypeField.selectValue('internal');

        contentEditor.getLanguageSwitcher().select('French');

        linkTypeField.selectValue('external');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');

        let linkTitleField = contentEditor.getSmallTextField('jmix:externalLink_j:linkTitle');
        let urlField = contentEditor.getSmallTextField('jmix:externalLink_j:url');
        linkTitleField.get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');
        urlField.get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');

        contentEditor.getLanguageSwitcher().select('German');

        linkTitleField = contentEditor.getSmallTextField('jmix:externalLink_j:linkTitle');
        urlField = contentEditor.getSmallTextField('jmix:externalLink_j:url');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');
        linkTitleField.get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');
        urlField.get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');

        linkTypeField.selectValue('none');
        cy.get('[data-sel-content-editor-field="jmix:externalLink_j:url"]').should('not.exist');

        contentEditor.getLanguageSwitcher().select('English');
        linkTypeField.get().contains('No link');
        linkTypeField.selectValue('internal');

        const picker = internalLinkField.open();
        picker.wait();
        cy.get('[data-sel-role-card="snowbearhome.jpeg"]').should('be.visible').contains('snowbearhome.jpeg').click();
        picker.select();

        contentEditor.getSmallTextField('jnt:imageReferenceLink_jcr:title').addNewValue(cypressDocumentManagerImageReferenceLinkTest);

        contentEditor.create();

        // Edit
        contentEditor = jcontent.editComponentByText(cypressDocumentManagerImageReferenceLinkTest);
        linkTypeField = contentEditor.getChoiceListField('jnt:imageReferenceLink_j:linkType');

        contentEditor.getTitle().should('be.visible').and('contain', 'Cypress document manager image reference');
        linkTypeField.selectValue('none');

        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');
        contentEditor.getLanguageSwitcher().select('French');
        linkTypeField.get().contains('Pas de lien');
        linkTypeField.selectValue('internal');

        contentEditor.getPickerField('jmix:internalLink_j:linknode').get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');

        contentEditor.getLanguageSwitcher().select('English');
        linkTypeField.get().contains('Internal');
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get()
            .should('exist')
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');
        // ContentEditor.cancelAndDiscard()
        contentEditor.cancel();
    });
});

describe('Add Mixin by using choice list initializers (Vanilla Node Type with transitive mixin extensions)', () => {
    let jcontent: JContent;
    const vanillaNodeTitle = 'Cypress vanilla node transitive mixin test';

    before(function () {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: sitekey});
        enableModule('jcontent-test-module', sitekey);
        cy.loginAndStoreSession();
    });

    after(function () {
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/content');
    });

    it('Can create and edit a vanilla node and switch between transitive mixin link types', () => {
        // Open content editor for mynt:nodetypeVanilla which has mymix:mixinExtendWithLink
        // extending it, which itself extends mymix:commonLink — transitive resolution is required
        const contentEditor = jcontent.createContent('cent:nodetypeVanilla');

        contentEditor.toggleOption('cemix:mixinExtendWithLink');
        const linkTypeField = contentEditor.getChoiceListField('cemix:mixinExtendWithLink_linkType');

        contentEditor.getTitle().should('be.visible').and('contain', 'Create');

        // The mymix:commonLink fields (linkLabel, linkType) should be visible
        // because mymix:mixinExtendWithLink extends mymix:commonLink and itself extends mynt:nodetypeVanilla
        linkTypeField.get().scrollIntoView({offset: fieldOffset}).should('be.visible');

        // Select internal link type — mymix:internalLink extends mymix:commonLink,
        // so its internalLink field must appear via transitive extension resolution
        linkTypeField.selectValue('internalLink');
        contentEditor.getPickerField('cemix:internalLink_internalLink').get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');
        // External link field must NOT appear when internal is selected
        cy.get('[data-sel-content-editor-field="cemix:externalLink_externalLink"]').should('not.exist');

        // Switch to external link type — mymix:externalLink extends mymix:commonLink,
        // so its externalLink (mandatory) field must appear, and internalLink must disappear
        linkTypeField.selectValue('externalLink');
        contentEditor.getSmallTextField('cemix:externalLink_externalLink').get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');
        cy.get('[data-sel-content-editor-field="cemix:internalLink_internalLink"]').should('not.exist');

        // Fill in required fields and save
        contentEditor.getSmallTextField('cemix:externalLink_externalLink').addNewValue('https://www.jahia.com');
        contentEditor.getSmallTextField('cent:nodetypeVanilla_jcr:title').addNewValue(vanillaNodeTitle);

        // Verify linkLabel (i18n field from cemix:commonLink) is also present
        contentEditor.getSmallTextField('cemix:mixinExtendWithLink_linkLabel').get()
            .scrollIntoView({offset: fieldOffset})
            .should('be.visible');

        contentEditor.create();

        // Switch language and verify mixin fields are still resolved transitively
        const contentEditorEdit = jcontent.editComponentByText(vanillaNodeTitle);
        const linkTypeFieldEdit = contentEditor.getChoiceListField('cemix:mixinExtendWithLink_linkType');

        contentEditorEdit.getTitle().should('be.visible');

        // LinkType should still show externalLink from previous test
        linkTypeFieldEdit.get().scrollIntoView({offset: fieldOffset}).should('be.visible').contains('externalLink');

        // Switch language — transitive mixin fields must remain resolved in French too
        contentEditorEdit.getLanguageSwitcher().select('French');
        contentEditorEdit.getSmallTextField('cemix:mixinExtendWithLink_linkLabel').get()
            .then($el => {
                $el[0].scrollIntoView({block: 'center', behavior: 'instant'});
            })
            .should('be.visible');
        contentEditorEdit.getSmallTextField('cemix:externalLink_externalLink').get()
            .then($el => {
                $el[0].scrollIntoView({block: 'center', behavior: 'instant'});
            })
            .should('be.visible');

        contentEditorEdit.cancel();
    });
});
