import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, PickerField, SmallTextField} from '../../page-object/fields';

// Regression test for https://github.com/Jahia/jcontent/issues/2853
//
// cemix:mixinExtendWithLink > cemix:commonLink, with `extends = cent:nodetypeVanilla`.
// cemix:internalLink and cemix:externalLink are jmix:templateMixin with `extends = cemix:commonLink`,
// and each is the addMixin of one value of the choicelist linkType that cemix:commonLink declares.
//
// The node type is cent:nodetypeVanilla, which is not a cemix:commonLink, so getExtendMixins used to
// stop at cemix:mixinExtendWithLink and never reach the two template mixins: the form had no
// fieldset for them, and changing linkType did nothing. Discovery now follows an extension into its
// own extensions, so a template mixin reached through an applied mixin gets its fieldset like one
// that extends the node type directly.
//
// Every test seeds or creates its own node, so none depends on what another one saved.
describe('Template mixins reached through the extends chain of an applied mixin', () => {
    const siteKey = 'transitiveExtendMixinSite';
    const contents = `/sites/${siteKey}/contents`;

    const STORED_EXTERNAL = {
        mixins: ['cemix:mixinExtendWithLink', 'cemix:externalLink'],
        properties: [
            {name: 'jcr:title', value: 'Stored external', language: 'en'},
            {name: 'linkType', value: 'externalLink'},
            {name: 'linkLabel', value: 'stored label', language: 'en'},
            {name: 'externalLink', value: 'https://stored.example'}
        ]
    };

    before(() => {
        createSite(siteKey, {languages: 'en,fr', templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        enableModule('jcontent-test-module', siteKey);
        ['storedExternal', 'storedSwitch'].forEach(name => addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:nodetypeVanilla',
            ...STORED_EXTERNAL
        }));
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    const appliedMixins = (name: string) => cy.apollo({
        queryFile: 'jcontent/getMixinTypes.graphql',
        variables: {path: `${contents}/${name}`}
    }).then(resp => resp?.data?.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.startsWith('cemix:')).sort().join(', '));

    const visitContents = () => JContent.visit(siteKey, 'en', 'content-folders/contents');

    const create = () => {
        const contentEditor = visitContents().createContent('cent:nodetypeVanilla');
        contentEditor.toggleOption('cemix:mixinExtendWithLink');
        return contentEditor;
    };

    const edit = (name: string) => visitContents().editComponentByRowName(name);

    it('shows the fields of each template mixin on a new node once the applied mixin is switched on', () => {
        const contentEditor = create();
        const linkType = contentEditor.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType');

        cy.log('linkLabel and linkType come from cemix:commonLink through cemix:mixinExtendWithLink');
        contentEditor.getField(SmallTextField, 'cemix:mixinExtendWithLink_linkLabel').assertVisible();
        linkType.assertVisible();

        linkType.selectValue('internalLink');
        contentEditor.getField(PickerField, 'cemix:internalLink_internalLink').assertVisible();
        cy.get('[data-sel-content-editor-field="cemix:externalLink_externalLink"]').should('not.exist');

        linkType.selectValue('externalLink');
        contentEditor.getField(SmallTextField, 'cemix:externalLink_externalLink').assertVisible();
        cy.get('[data-sel-content-editor-field="cemix:internalLink_internalLink"]').should('not.exist');

        contentEditor.cancelAndDiscard();
    });

    // A fieldset the form never built is not in getDynamicFieldSets(), so the save would drop the
    // mixin even if the field had shown: the stored mixins are what prove the fix end to end.
    it('applies the applied mixin and the selected template mixin on create', () => {
        const contentEditor = create();
        contentEditor.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType').selectValue('externalLink');
        contentEditor.getField(SmallTextField, 'cemix:externalLink_externalLink').addNewValue('https://www.jahia.com');
        contentEditor.getField(SmallTextField, 'cent:nodetypeVanilla_jcr:title').addNewValue('Fresh external');
        contentEditor.create();

        appliedMixins('fresh-external').should('equal', 'cemix:externalLink, cemix:mixinExtendWithLink');

        const reopened = edit('fresh-external');
        reopened.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType').shouldHaveSelectedValue('externalLink');
        reopened.getField(SmallTextField, 'cemix:externalLink_externalLink').checkValue('https://www.jahia.com');
        reopened.cancel();
    });

    it('shows the stored template mixin fields on a node that already carries the applied mixin, in every language', () => {
        const contentEditor = edit('storedExternal');
        // The edit form is filled once its data loads, so wait for a stored value before reading the rest.
        contentEditor.getField(SmallTextField, 'cent:nodetypeVanilla_jcr:title').checkValue('Stored external');

        contentEditor.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType').shouldHaveSelectedValue('externalLink');
        contentEditor.getField(SmallTextField, 'cemix:mixinExtendWithLink_linkLabel').checkValue('stored label');
        contentEditor.getField(SmallTextField, 'cemix:externalLink_externalLink').checkValue('https://stored.example');

        cy.log('the fieldsets stay resolved in another language: linkLabel is i18n and empty in fr, externalLink is shared');
        contentEditor.getLanguageSwitcher().selectLangByValue('fr');
        contentEditor.getField(SmallTextField, 'cemix:mixinExtendWithLink_linkLabel').assertVisible();
        contentEditor.getField(SmallTextField, 'cemix:externalLink_externalLink').checkValue('https://stored.example');

        contentEditor.cancel();
    });

    it('switches the template mixin on a stored node and keeps the applied mixin', () => {
        const contentEditor = edit('storedSwitch');
        contentEditor.getField(SmallTextField, 'cent:nodetypeVanilla_jcr:title').checkValue('Stored external');

        contentEditor.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType').selectValue('internalLink');
        contentEditor.getField(PickerField, 'cemix:internalLink_internalLink').assertVisible();
        cy.get('[data-sel-content-editor-field="cemix:externalLink_externalLink"]').should('not.exist');
        contentEditor.save();

        appliedMixins('storedSwitch').should('equal', 'cemix:internalLink, cemix:mixinExtendWithLink');
    });
});
