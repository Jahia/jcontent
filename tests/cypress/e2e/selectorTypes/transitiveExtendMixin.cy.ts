import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, PickerField, SmallTextField} from '../../page-object/fields';
import gql from 'graphql-tag';

// Regression test for https://github.com/Jahia/jcontent/issues/2853
//
// cemix:mixinExtendWithLink > cemix:commonLink, with `extends = cent:nodetypeVanilla`.
// cemix:internalLink and cemix:externalLink are jmix:templateMixin with `extends = cemix:commonLink`,
// and each is the addMixin of one value of the choicelist linkType that cemix:commonLink declares.
//
// The node type is cent:nodetypeVanilla, which is not a cemix:commonLink, so getExtendMixins used to
// stop at cemix:mixinExtendWithLink and never reach the two template mixins: the form had no
// fieldset for them, and changing linkType did nothing. Discovery now follows an extension into the
// template mixins that extend it, so a template mixin reached through an applied mixin gets its
// fieldset like one that extends the node type directly.
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
        addNode({
            parentPathOrId: contents,
            name: 'appliedCommonLink',
            primaryNodeType: 'cent:appliedMixinTest',
            mixins: ['cemix:commonLink'],
            properties: [
                {name: 'jcr:title', value: 'Applied common link', language: 'en'},
                {name: 'linkType', value: 'internalLink'}
            ]
        });
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

    const createFormFieldSets = (primaryNodeType: string) => cy.apollo({
        query: gql`query createFormFieldSets($primaryNodeType: String!, $path: String!) {
            forms {
                createForm(primaryNodeType: $primaryNodeType, uiLocale: "en", locale: "en", uuidOrPath: $path) {
                    sections { fieldSets { name } }
                }
            }
        }`,
        variables: {primaryNodeType, path: contents}
    }).then(resp => resp.data.forms.createForm.sections
        .reduce((names: string[], section: {fieldSets: {name: string}[]}) => names.concat(section.fieldSets.map(fieldSet => fieldSet.name)), []));

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

    // Past the first level only template mixins are followed: cemix:linkSeo is a plain mixin that extends
    // cemix:commonLink, and its own switch could apply it to a node that is no cemix:commonLink.
    it('offers no switch for a plain mixin that extends the applied mixin', () => {
        const contentEditor = visitContents().createContent('cent:nodetypeVanilla');
        contentEditor.getDynamicFieldset('cemix:mixinExtendWithLink').should('exist');
        contentEditor.getDynamicFieldset('cemix:linkSeo').should('not.exist');

        contentEditor.toggleOption('cemix:mixinExtendWithLink');
        contentEditor.getField(ChoiceListField, 'cemix:mixinExtendWithLink_linkType').assertVisible();
        contentEditor.getDynamicFieldset('cemix:linkSeo').should('not.exist');
        cy.get('[data-sel-content-editor-field="cemix:linkSeo_seoTitle"]').should('not.exist');

        contentEditor.cancelAndDiscard();
    });

    // Bad form, which the concept doc tells authors to avoid: the template mixin cemix:invalidInheritAndExtend
    // inherits cemix:invalidInheritAndExtendBase and extends it. Once reached, it must not take away the
    // switch of its base as a mixin that inherits it would. No other test uses these types.
    it('keeps the switch of a mixin when a template mixin reached through it inherits it', () => {
        const contentEditor = visitContents().createContent('cent:invalidInheritAndExtendTest');
        contentEditor.getDynamicFieldset('cemix:invalidInheritAndExtendBase').find('input').should('exist');

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

    // The mixin cemix:commonLink is applied to the node, not offered through an extends of its type: the form
    // shows it with no switch, so it counts like the primary type and its choicelist reaches the template mixins.
    it('applies the template mixin that the choicelist of a mixin applied to the node selects', () => {
        const contentEditor = edit('appliedCommonLink');
        contentEditor.getField(SmallTextField, 'cent:appliedMixinTest_jcr:title').checkValue('Applied common link');

        cy.log('a plain mixin that extends cemix:commonLink gets a switch, since the node keeps cemix:commonLink');
        contentEditor.getDynamicFieldset('cemix:linkSeo').find('input').should('exist');

        contentEditor.getField(ChoiceListField, 'cemix:commonLink_linkType').selectValue('externalLink');
        contentEditor.getField(SmallTextField, 'cemix:externalLink_externalLink').addNewValue('https://applied.example');
        contentEditor.save();

        appliedMixins('appliedCommonLink').should('equal', 'cemix:commonLink, cemix:externalLink');
    });

    // The template mixin cemix:templateChainSecond is two levels below cemix:templateChainBase, and it extends
    // back the member that leads to it: the form reaches it and its request ends.
    it('reaches a template mixin two levels down a chain that loops', () => {
        createFormFieldSets('cent:templateChainTest').should(names => {
            expect(names).to.include.members(['cemix:templateChainBase', 'cemix:templateChainFirst', 'cemix:templateChainSecond']);
        });
    });
});
