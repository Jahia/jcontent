import {JContent} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

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
    });

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

        cy.log('Re-open the page editor and verify the inherited fields are still visible');
        contentEditor = jcontent.editPage();
        contentEditor.switchToAdvancedMode();

        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_title').assertVisible();
        contentEditor.getSmallTextField('cemix:subtypeExtendMixin_description').assertVisible();

        cy.log('cemix:supertypeExtendMixin still must not appear as an independent fieldset');
        contentEditor.getDynamicFieldset('cemix:supertypeExtendMixin').should('not.exist');

        contentEditor.cancel();
    });
});
