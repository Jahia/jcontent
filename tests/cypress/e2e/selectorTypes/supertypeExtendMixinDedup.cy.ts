import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';

// Regression test for: non-deterministic field assignment when mixin B is both a supertype of
// mixin A and independently present in getExtendMixins() results. The fix in
// EditorFormServiceImpl removes the supertype (cemix:supertypeExtendMixin) from the list
// when the subtype (cemix:subtypeExtendMixin) is also present, ensuring only the subtype
// fieldset is created and its inherited fields are always visible.
describe('Supertype extend mixin deduplication', () => {
    const siteKey = 'supertypeExtendMixinSite';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        // A page that carries BOTH mixins explicitly, in the order a reader reaches by switching
        // on cemix:supertypeExtendMixin first and cemix:subtypeExtendMixin later. Applied mixins get
        // their own pass over the form, so this is a path the extend-mixin dedup alone does not cover.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'bothApplied',
            primaryNodeType: 'jnt:page',
            mixins: ['cemix:supertypeExtendMixin', 'cemix:subtypeExtendMixin'],
            properties: [
                {name: 'jcr:title', value: 'Both applied', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'home'}
            ]
        });
    });

    const appliedMixins = (path: string) => cy.apollo({
        queryFile: 'jcontent/getMixinTypes.graphql',
        variables: {path}
    }).then(resp => resp?.data?.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.includes('ExtendMixin')).sort().join(', '));

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Supertype extend mixin is excluded from standalone fieldset list', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        const contentEditor = jcontent.editPage();

        cy.log('cemix:supertypeExtendMixin must not appear as an independent dynamic fieldset — it is deduplicated because cemix:subtypeExtendMixin extends it');
        contentEditor.getDynamicFieldset('cemix:supertypeExtendMixin').should('not.exist');

        cy.log('cemix:subtypeExtendMixin should be present as the active dynamic fieldset');
        contentEditor.getDynamicFieldset('cemix:subtypeExtendMixin').should('exist');

        contentEditor.cancel();
    });

    it('Fields from supertype extend mixin are visible when subtype mixin is activated', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        const contentEditor = jcontent.editPage();

        cy.log('Enable cemix:subtypeExtendMixin — its inherited fields from cemix:supertypeExtendMixin must appear');
        contentEditor.toggleOption('cemix:subtypeExtendMixin');

        cy.log('title and description (declared in cemix:supertypeExtendMixin) must be visible');
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_title').assertVisible();
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_description').assertVisible();

        cy.log('pageType (declared in cemix:subtypeExtendMixin itself) must also be visible');
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_pageType').assertVisible();

        contentEditor.cancelAndDiscard();
    });

    it('Fields from supertype extend mixin persist after save', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        let contentEditor = jcontent.editPage();

        cy.log('Activate the subtype mixin and save');
        contentEditor.toggleOption('cemix:subtypeExtendMixin');
        contentEditor.save();

        cy.log('Only the subtype is applied: the supertype comes with it and must not be added on its own');
        appliedMixins(`/sites/${siteKey}/home`).should('equal', 'cemix:subtypeExtendMixin');

        cy.log('Re-open the page editor and verify the inherited fields are still visible');
        contentEditor = jcontent.editPage();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_title').assertVisible();
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_description').assertVisible();

        cy.log('cemix:supertypeExtendMixin still must not appear as an independent fieldset');
        contentEditor.getDynamicFieldset('cemix:supertypeExtendMixin').should('not.exist');

        contentEditor.cancel();
    });

    it('Supertype extend mixin gets no fieldset of its own on a page that carries both mixins', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/bothApplied');
        const contentEditor = jcontent.editPage();
        contentEditor.switchToAdvancedMode();

        cy.log('cemix:supertypeExtendMixin is applied explicitly, but cemix:subtypeExtendMixin already carries its fields');
        contentEditor.getDynamicFieldset('cemix:supertypeExtendMixin').should('not.exist');
        contentEditor.getDynamicFieldset('cemix:subtypeExtendMixin').should('exist');
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_title').assertVisible();

        contentEditor.cancel();
    });
});
