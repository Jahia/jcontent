import {addNode, getNodeByPath, uploadFile} from '@jahia/cypress';
import {JContent} from '../../page-object/';

const sitekey = 'contentEditorSiteAddMixin';
const fieldOffset = {top: -200, left: 0};
describe('Add Mixin by using choice list initializers (Image Reference)', () => {
    let jcontent: JContent;
    const contents = `/sites/${sitekey}/contents`;
    const cypressDocumentManagerImageReferenceLinkTest = 'Cypress document manager image reference link Test';

    // The fixtures go through GraphQL, so no test depends on the node that another one saved.
    before(function () {
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: sitekey});
        uploadFile('contentEditor/snowbearHome.jpeg', `/sites/${sitekey}/files`, 'snowbearHome.jpeg', 'image/jpeg')
            .its('data.jcr.addNode.uuid').should('be.a', 'string');
        addNode({
            parentPathOrId: contents,
            name: 'stored-internal-link',
            primaryNodeType: 'jnt:imageReferenceLink',
            mixins: ['jmix:internalLink'],
            properties: [
                {name: 'jcr:title', value: 'Stored internal link', language: 'en'},
                {name: 'j:linkType', value: 'internal'}
            ]
        }).its('data.jcr.addNode.uuid').should('be.a', 'string');
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: sitekey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(sitekey, 'en', 'content-folders/content');
    });

    it('Can create a document manager image reference link', () => {
        const contentEditor = jcontent.createContent('jnt:imageReferenceLink');
        const linkTypeField = contentEditor.getChoiceListField('jnt:imageReferenceLink_j:linkType');
        const internalLinkField = contentEditor.getPickerField('jnt:imageReferenceLink_j:node');

        contentEditor.getTitle().should('be.visible').and('contain', 'Create Image (Internationalized)');
        linkTypeField.selectValue('internal');
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');

        contentEditor.getLanguageSwitcher().selectLangByValue('fr');
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');

        linkTypeField.selectValue('external');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');

        let linkTitleField = contentEditor.getSmallTextField('jmix:externalLink_j:linkTitle');
        let urlField = contentEditor.getSmallTextField('jmix:externalLink_j:url');
        linkTitleField.get().scrollIntoView({offset: fieldOffset});
        linkTitleField.get().should('be.visible');
        urlField.get().scrollIntoView({offset: fieldOffset});
        urlField.get().should('be.visible');

        contentEditor.getLanguageSwitcher().selectLangByValue('de');

        linkTitleField = contentEditor.getSmallTextField('jmix:externalLink_j:linkTitle');
        urlField = contentEditor.getSmallTextField('jmix:externalLink_j:url');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');
        linkTitleField.get().scrollIntoView({offset: fieldOffset});
        linkTitleField.get().should('be.visible');
        urlField.get().scrollIntoView({offset: fieldOffset});
        urlField.get().should('be.visible');

        linkTypeField.selectValue('none');
        cy.get('[data-sel-content-editor-field="jmix:externalLink_j:url"]').should('not.exist');

        contentEditor.getLanguageSwitcher().selectLangByValue('en');
        linkTypeField.get().contains('No link');
        linkTypeField.selectValue('internal');

        const picker = internalLinkField.open();
        picker.wait();
        cy.get('[data-sel-role-card="snowbearHome.jpeg"]').should('be.visible').contains('snowbearHome.jpeg').click();
        picker.select();

        contentEditor.getSmallTextField('jnt:imageReferenceLink_jcr:title').addNewValue(cypressDocumentManagerImageReferenceLinkTest);

        contentEditor.create();

        // The create saved the selected link type and applied its template mixin
        const created = `${contents}/cypress-document-manager-image-reference-link-test`;
        getNodeByPath(created, ['j:linkType']).then(resp => {
            expect(resp?.data?.jcr.nodeByPath.properties.find((p: {name: string}) => p.name === 'j:linkType')?.value).to.equal('internal');
        });
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: created}
        }).then(resp => {
            expect(resp?.data?.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name)).to.include('jmix:internalLink');
        });
    });

    it('Can edit a document manager image reference link', () => {
        const contentEditor = jcontent.editComponentByRowName('stored-internal-link');
        const linkTypeField = contentEditor.getChoiceListField('jnt:imageReferenceLink_j:linkType');

        contentEditor.getTitle().should('be.visible').and('contain', 'Stored internal link');
        linkTypeField.get().contains('Internal');
        linkTypeField.selectValue('none');

        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('not.exist');
        contentEditor.getLanguageSwitcher().selectLangByValue('fr');
        // Choicelist labels follow the UI language, which stays English when only the content language changes
        linkTypeField.get().contains('No link');
        linkTypeField.selectValue('internal');

        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');

        contentEditor.getLanguageSwitcher().selectLangByValue('en');
        linkTypeField.get().contains('Internal');
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().scrollIntoView({offset: fieldOffset});
        contentEditor.getPickerField('jmix:internalLink_j:linknode').get().should('be.visible');
        contentEditor.cancel();
    });
});
