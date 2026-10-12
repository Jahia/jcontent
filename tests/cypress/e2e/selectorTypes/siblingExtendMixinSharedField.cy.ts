import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, SmallTextField} from '../../page-object/fields';

// Apollo batches operations, so a POST to /modules/graphql carries an ARRAY of
// {operationName, variables, query} entries -- reading req.body.variables straight off the request
// is always undefined, however many operations it holds. Pick the operation out by name instead.
interface FieldConstraintsOp {
    operationName?: string;
    variables?: {
        nodeType?: string;
        fieldName?: string;
        context?: Array<{key: string; value: string}>;
    };
}

const fieldConstraintsOps = (body: unknown): FieldConstraintsOp[] =>
    (Array.isArray(body) ? body : [body]).filter((op: FieldConstraintsOp) => op?.operationName === 'fieldConstraints');

// Regression test for https://github.com/Jahia/jcontent/issues/2746
//
// cemix:youtubeGenericPlayer, cemix:vimeoGenericPlayer and cemix:switchTubeGenericPlayer each
// `extends = cent:videoPlayerTest` and each inherit sharedNote and sharedMode from the shared
// supertype cemix:sharedPlayerOptions. A field is identified by declaringNodeType + name
// (Field#getKey), so all three inherited copies carry the SAME key. Form#findAndRemoveField used
// to treat that as one field and re-home the single copy into whichever fieldset merged last,
// so two of the three players silently lost the inherited fields.
//
// The mixins are applied the way the ticket applies them: an addMixin choicelist on videoType
// (see cent_videoPlayerTest.json), not a toggle -- they are jmix:templateMixin, so they carry no
// enable switch and getDynamicFieldset() does not apply to them.
//
// The PR body also flags a cascading choicelist (sharedQuality depends on sharedMode AND
// sharedZone) as untested: repainting it reads the OTHER driving property's value off whichever
// fieldset copy is actually being edited, not off one of the inactive sibling copies sitting in
// the same form -- see the last test below.
describe('Sibling extend mixins sharing an inherited field', () => {
    const siteKey = 'siblingExtendMixinSite';

    const PLAYERS = [
        {mixin: 'cemix:youtubeGenericPlayer', ownField: 'youtubeId'},
        {mixin: 'cemix:vimeoGenericPlayer', ownField: 'vimeoId'},
        {mixin: 'cemix:switchTubeGenericPlayer', ownField: 'switchTubeId'}
    ];

    const addPlayerNode = (name: string) => addNode({
        parentPathOrId: `/sites/${siteKey}/contents`,
        name,
        primaryNodeType: 'cent:videoPlayerTest'
    });

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addPlayerNode('eachPlayer');
        addPlayerNode('twoPlayersAtOnce');
        addPlayerNode('switchBetweenPlayers');
        addPlayerNode('cascadingChoicelist');

        // The node for the two-at-once case carries both mixins before the editor ever opens, which
        // no choicelist selection can produce -- videoType is single-valued.
        cy.apollo({
            mutationFile: 'jcontent/jcrAddMixins.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/contents/twoPlayersAtOnce`,
                mixins: ['cemix:vimeoGenericPlayer', 'cemix:switchTubeGenericPlayer']
            }
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    // The reported bug. Before the fix, only one of the three players showed the inherited fields.
    PLAYERS.forEach(({mixin, ownField}) => {
        it(`shows the inherited fields when ${mixin} is selected`, () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const contentEditor = jcontent.editComponentByRowName('eachPlayer');

            contentEditor.getField(ChoiceListField, 'cent:videoPlayerTest_videoType').selectValue(mixin);

            cy.log(`${ownField}, declared by the player's own id mixin, must be visible`);
            contentEditor.getField(SmallTextField, `${mixin}_${ownField}`).assertVisible();

            cy.log('sharedNote and sharedMode, inherited from cemix:sharedPlayerOptions, must be visible too');
            contentEditor.getField(SmallTextField, `${mixin}_sharedNote`).assertVisible();
            contentEditor.getField(ChoiceListField, `${mixin}_sharedMode`).assertVisible();

            contentEditor.cancelAndDiscard();
        });
    });

    // Each sibling keeping its own copy is what makes the fields appear for whichever player is
    // chosen. Two siblings active at once must still put ONE input over the single JCR property,
    // or the second input silently overwrites the first on save.
    it('renders one input for a property two active siblings both inherit', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('twoPlayersAtOnce');

        // Existence, not be.visible: with both players active the form is taller than the viewport,
        // and the editor's fixed layout makes viewport visibility depend on where the form happens to
        // have scrolled to. What this test is about is which fieldsets contribute a field, which is
        // what existence states -- the count assertions below are the actual subject.
        cy.log('both players contribute their own id field');
        cy.get('[data-sel-content-editor-field="cemix:vimeoGenericPlayer_vimeoId"]').should('exist');
        cy.get('[data-sel-content-editor-field="cemix:switchTubeGenericPlayer_switchTubeId"]').should('exist');

        cy.log('but the inherited properties are editable in exactly one place');
        cy.get('[data-sel-content-editor-field$="_sharedNote"]').should('have.length', 1);
        cy.get('[data-sel-content-editor-field$="_sharedMode"]').should('have.length', 1);

        contentEditor.cancel();
    });

    // Regression test for the initial-values defect fixed alongside the sibling-mixin fix above.
    //
    // Each sibling owns a copy of the inherited property, including the siblings that are NOT
    // active. getInitialValues() hydrates every copy from the node, then used to overlay default
    // values over the copies belonging to inactive dynamic fieldsets with the overlay spread last,
    // so it won. sharedMode carries a default ('auto'), so the inactive sibling's copy was reset to
    // it before the reader ever switched players, and switching then saved that default over the
    // stored value. The fix (getStoredProperty, matched by propertyName + declaringNodeType) skips
    // the overlay once a real stored value is found, sibling-inactive or not.
    //
    // Both copies are asserted. Reopening the editor finds vimeo applied and switchTube not, so
    // vimeo's copy is the ACTIVE one and switchTube's the inactive one; selecting switchTube
    // activates it client-side without refetching the form, so what it shows is the initial value
    // computed for it while it was still inactive -- which is exactly where the overlay struck.
    // sharedNote has no default and resolves to the Text selector, which defines no initValue, so it
    // was never at risk from the overlay; it is asserted throughout to keep the two apart.
    it('keeps a value stored under one sibling when another sibling is selected', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('switchBetweenPlayers');

        contentEditor.getField(ChoiceListField, 'cent:videoPlayerTest_videoType').selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').addNewValue('note typed under vimeo');
        contentEditor.getField(ChoiceListField, 'cemix:vimeoGenericPlayer_sharedMode').selectValue('manual');
        contentEditor.save();

        const contentEditor2 = JContent.visit(siteKey, 'en', 'content-folders/contents')
            .editComponentByRowName('switchBetweenPlayers');

        cy.log('the active sibling holds what was stored, before anything is switched');
        contentEditor2.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').checkValue('note typed under vimeo');
        contentEditor2.getField(ChoiceListField, 'cemix:vimeoGenericPlayer_sharedMode').assertSelected('manual');

        cy.log('switch the player -- the properties belong to the shared supertype, not to vimeo');
        contentEditor2.getField(ChoiceListField, 'cent:videoPlayerTest_videoType').selectValue('cemix:switchTubeGenericPlayer');

        cy.log('the stored values must carry over into the newly selected player, not reset to defaults');
        contentEditor2.getField(SmallTextField, 'cemix:switchTubeGenericPlayer_sharedNote').checkValue('note typed under vimeo');
        contentEditor2.getField(ChoiceListField, 'cemix:switchTubeGenericPlayer_sharedMode').assertSelected('manual');
        contentEditor2.save();

        cy.log('and they must still be stored after the save');
        const contentEditor3 = JContent.visit(siteKey, 'en', 'content-folders/contents')
            .editComponentByRowName('switchBetweenPlayers');
        contentEditor3.getField(SmallTextField, 'cemix:switchTubeGenericPlayer_sharedNote').checkValue('note typed under vimeo');
        contentEditor3.getField(ChoiceListField, 'cemix:switchTubeGenericPlayer_sharedMode').assertSelected('manual');

        contentEditor3.cancel();
    });

    // The cascading choicelist the PR body flags as untested. sharedQuality's dependentProperties
    // lists two properties, sharedMode and sharedZone -- so changing sharedMode (a field already
    // exercised above) fires a fieldConstraints refetch of sharedQuality that must read sharedZone's
    // CURRENT value off the fieldset actually being edited. The value is looked up by propertyName
    // across every sibling copy of sharedZone, active or not (see registerSelectorTypesOnChange.js);
    // scoping that lookup to the active fieldsets first is the fix under test here. Only vimeo is
    // ever activated on this node, so youtube's and switchTube's copies of sharedZone sit inactive
    // at their CND default ('na') the whole time -- reading either of them instead of vimeo's edited
    // copy sends the wrong context and this test catches it.
    it('repaints the dependent choicelist using the active sibling copy of the other driving property', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('cascadingChoicelist');

        contentEditor.getField(ChoiceListField, 'cent:videoPlayerTest_videoType').selectValue('cemix:vimeoGenericPlayer');

        cy.log('give the active vimeo copy of sharedZone a value neither inactive sibling copy holds');
        contentEditor.getField(ChoiceListField, 'cemix:vimeoGenericPlayer_sharedZone').selectValue('eu');

        cy.intercept('POST', '**/modules/graphql', req => {
            if (fieldConstraintsOps(req.body).some(op => op.variables?.fieldName === 'sharedQuality')) {
                req.alias = 'sharedQualityConstraints';
            }
        });

        cy.log('changing sharedMode must refetch sharedQuality with sharedZone read from vimeo, not youtube/switchTube');
        contentEditor.getField(ChoiceListField, 'cemix:vimeoGenericPlayer_sharedMode').selectValue('manual');

        cy.wait('@sharedQualityConstraints').then(({request}) => {
            // Every sibling copy of sharedQuality is refetched, so the batch holds one operation per
            // copy. vimeo's is the one under test: it is the only active one.
            const vimeoOp = fieldConstraintsOps(request.body)
                .find(op => op.variables?.nodeType === 'cemix:vimeoGenericPlayer' && op.variables?.fieldName === 'sharedQuality');
            expect(vimeoOp, 'vimeo\'s copy of sharedQuality must be refetched').to.not.be.undefined;

            const sharedZone = vimeoOp?.variables?.context?.find(entry => entry.key === 'sharedZone');
            expect(sharedZone, 'sharedZone must be part of the refetch context').to.not.be.undefined;
            expect(sharedZone?.value, 'sharedZone must come from the active vimeo copy, not an inactive sibling').to.eq('eu');
        });

        contentEditor.cancelAndDiscard();
    });
});
