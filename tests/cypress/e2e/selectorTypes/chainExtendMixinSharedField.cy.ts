import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, SmallTextField} from '../../page-object/fields';

// Regression test for the chain variant of https://github.com/Jahia/jcontent/issues/2746
// reported at https://github.com/Jahia/jcontent/issues/2746#issuecomment-5905620339
//
// cemix:chainPopin > cemix:chainSuccess > cemix:chainRedirect, every member declaring
// `extends = cent:actionTest` and every member its own addMixin target on actionType.
//
// This is NOT the sibling case #2764 fixed. There, all three fieldsets existed and one inherited
// field was moved between them by the merge. Here getExtendMixins (#2467) drops any entry that
// another entry extends, so cemix:chainRedirect and cemix:chainSuccess never get a fieldset at
// all -- only the most derived member of the chain survives. Selecting either of the other two in
// the choicelist then finds no fields to move (contentEditorHelper matches on fieldSet name) and
// the editor shows nothing.
//
// Expected to FAIL on cemix:chainRedirect and cemix:chainSuccess and PASS on cemix:chainPopin
// until the chain is fixed -- that split is the point: it shows the fieldset that survived the
// de-duplication from the two that did not.
describe('Chained extend mixins each addMixin targets', () => {
    const siteKey = 'chainExtendMixinSite';

    // Each member shows its own property plus everything it inherits from further up the chain.
    const CHAIN = [
        {mixin: 'cemix:chainRedirect', fields: ['pageSuccess']},
        {mixin: 'cemix:chainSuccess', fields: ['pageSuccess', 'toastSuccess']},
        {mixin: 'cemix:chainPopin', fields: ['pageSuccess', 'toastSuccess', 'titrePopin']}
    ];

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        CHAIN.forEach(({mixin}) => addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: mixin.replace('cemix:', ''),
            primaryNodeType: 'cent:actionTest'
        }));
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'switchAlongChain',
            primaryNodeType: 'cent:actionTest'
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    CHAIN.forEach(({mixin, fields}) => {
        it(`shows every inherited field when ${mixin} is selected`, () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const contentEditor = jcontent.editComponentByRowName(mixin.replace('cemix:', ''));

            contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue(mixin);

            fields.forEach(field => {
                cy.log(`${field} must be visible under ${mixin}`);
                contentEditor.getField(SmallTextField, `${mixin}_${field}`).assertVisible();
            });

            contentEditor.cancelAndDiscard();
        });
    });

    // The mixin the reader picked must actually land on the node. A chain member with no fieldset
    // of its own is not in getDynamicFieldSets(), so getMixinsToMutate() never sees it and the
    // save silently drops it -- the failure is in the stored data, not only on screen.
    it('applies the selected chain member as a mixin on save', () => {
        const nodePath = `/sites/${siteKey}/contents/switchAlongChain`;

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('switchAlongChain');
        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainSuccess');
        contentEditor.getField(SmallTextField, 'cemix:chainSuccess_pageSuccess').addNewValue('redirect target');
        contentEditor.save();

        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: nodePath}
        }).should(resp => {
            const mixinNames = resp?.data?.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name);
            expect(mixinNames).to.include('cemix:chainSuccess');
        });
    });

    // A property declared further up the chain is one property. Moving along the chain must carry
    // its stored value, exactly as #2764 made it carry between siblings.
    it('keeps a value stored under one chain member when a deeper one is selected', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('switchAlongChain');

        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainPopin');

        cy.log('pageSuccess was stored under cemix:chainSuccess; cemix:chainPopin inherits it through the chain');
        contentEditor.getField(SmallTextField, 'cemix:chainPopin_pageSuccess').checkValue('redirect target');

        contentEditor.cancelAndDiscard();
    });
});
