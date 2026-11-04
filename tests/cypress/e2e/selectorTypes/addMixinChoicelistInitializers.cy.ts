import {JContent} from '../../page-object/';

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
        cy.get('[data-sel-role-card="snowbearHome.jpeg"]').should('be.visible');
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
        linkTitleField.get().scrollIntoView({offset: fieldOffset});
        linkTitleField.get().should('be.visible');
        urlField.get().scrollIntoView({offset: fieldOffset});
        urlField.get().should('be.visible');

        contentEditor.getLanguageSwitcher().select('German');

        linkTitleField = contentEditor.getSmallTextField('jmix:externalLink_j:linkTitle');
        urlField = contentEditor.getSmallTextField('jmix:externalLink_j:url');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');
        linkTitleField.get().scrollIntoView({offset: fieldOffset});
        linkTitleField.get().should('be.visible');
        urlField.get().scrollIntoView({offset: fieldOffset});
        urlField.get().should('be.visible');

        linkTypeField.selectValue('none');
        cy.get('[data-sel-content-editor-field="jmix:externalLink_j:url"]').should('not.exist');

        contentEditor.getLanguageSwitcher().select('English');
        linkTypeField.get().contains('No link');
        linkTypeField.selectValue('internal');

        const picker = internalLinkField.open();
        picker.wait();
        cy.get('[data-sel-role-card="snowbearHome.jpeg"]').should('be.visible').contains('snowbearHome.jpeg').click();
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
        // Choicelist labels follow the UI language, which stays English when only the content language changes
        linkTypeField.get().contains('No link');
        linkTypeField.selectValue('internal');

        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');

        contentEditor.getLanguageSwitcher().select('English');
        linkTypeField.get().contains('Internal');
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');
        // ContentEditor.cancelAndDiscard()
        contentEditor.cancel();
    });
});
