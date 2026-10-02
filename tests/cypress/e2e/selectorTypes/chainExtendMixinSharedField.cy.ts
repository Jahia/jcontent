import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, SmallTextField} from '../../page-object/fields';

// Regression test for the chain variant of https://github.com/Jahia/jcontent/issues/2746
// reported at https://github.com/Jahia/jcontent/issues/2746#issuecomment-5905620339
//
// cemix:chainPopin > cemix:chainSuccess > cemix:chainRedirect, every member declaring
// `extends = cent:actionTest` and every member a value of the addMixin choicelist actionType.
//
// This is NOT the sibling case #2764 fixed. There, all three fieldsets existed and one inherited
// field was moved between them by the merge. Here the de-duplication of extend mixins (#2467) used
// to drop any entry that another entry extends, so only the most derived member of the chain got a
// fieldset, and selecting either of the other two showed nothing (contentEditorHelper matches on
// fieldSet name). Every member of the chain must show its own fields, on a fresh node and on one
// that already carries a member, and the save must apply exactly the member that was selected.
//
// Every test seeds its own node, so none depends on what another one saved.
describe('Chained extend mixins each addMixin targets', () => {
    const siteKey = 'chainExtendMixinSite';
    const contents = `/sites/${siteKey}/contents`;

    // Each member shows its own property plus everything it inherits from further up the chain.
    const CHAIN = [
        {mixin: 'cemix:chainRedirect', fields: ['pageSuccess']},
        {mixin: 'cemix:chainSuccess', fields: ['pageSuccess', 'toastSuccess']},
        {mixin: 'cemix:chainPopin', fields: ['pageSuccess', 'toastSuccess', 'titrePopin']}
    ];

    const STORED_POPIN = {
        mixins: ['cemix:chainPopin'],
        properties: [
            {name: 'actionType', value: 'cemix:chainPopin'},
            {name: 'pageSuccess', value: 'stored page', language: 'en'},
            {name: 'toastSuccess', value: 'stored toast', language: 'en'},
            {name: 'titrePopin', value: 'stored title', language: 'en'}
        ]
    };

    const STORED_SUCCESS = {
        mixins: ['cemix:chainSuccess'],
        properties: [
            {name: 'actionType', value: 'cemix:chainSuccess'},
            {name: 'pageSuccess', value: 'stored page', language: 'en'},
            {name: 'toastSuccess', value: 'stored toast', language: 'en'}
        ]
    };

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        [...CHAIN.map(({mixin}) => mixin.replace('cemix:', '')), 'freshSave'].forEach(name => addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:actionTest'
        }));
        // Nodes that already carry a chain member. Before this fix only the most derived member
        // could be saved, so content that already exists carries cemix:chainPopin.
        ['storedPopin', 'storedPopinUp', 'storedPopinNoop'].forEach(name => addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:actionTest',
            ...STORED_POPIN
        }));
        ['storedSuccessDown'].forEach(name => addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:actionTest',
            ...STORED_SUCCESS
        }));
    });

    const appliedMixins = (name: string) => cy.apollo({
        queryFile: 'jcontent/getMixinTypes.graphql',
        variables: {path: `${contents}/${name}`}
    }).then(resp => resp?.data?.jcr.nodeByPath.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.startsWith('cemix:chain')).sort().join(', '));

    const edit = (name: string) => JContent.visit(siteKey, 'en', 'content-folders/contents').editComponentByRowName(name);

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    CHAIN.forEach(({mixin, fields}) => {
        it(`shows every inherited field when ${mixin} is selected`, () => {
            const contentEditor = edit(mixin.replace('cemix:', ''));

            contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue(mixin);

            fields.forEach(field => {
                cy.log(`${field} must be visible under ${mixin}`);
                contentEditor.getField(SmallTextField, `${mixin}_${field}`).assertVisible();
            });

            contentEditor.cancelAndDiscard();
        });
    });

    // The mixin the reader picked must actually land on the node, and nothing else of the chain. A
    // chain member with no fieldset of its own is not in getDynamicFieldSets(), so getMixinsToMutate()
    // never sees it and the save drops it: the failure is in the stored data, not only on screen.
    it('applies exactly the selected chain member on save', () => {
        const contentEditor = edit('freshSave');
        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainSuccess');
        contentEditor.getField(SmallTextField, 'cemix:chainSuccess_pageSuccess').addNewValue('redirect target');
        contentEditor.save();

        appliedMixins('freshSave').should('equal', 'cemix:chainSuccess');
    });

    // Activation follows the mixins applied directly: a node carrying cemix:chainPopin is also of
    // type cemix:chainSuccess and cemix:chainRedirect, but neither of those is selected. Moving UP
    // the chain from a stored member must still show the fields of the member the reader picked,
    // with the values the node stores.
    [
        {mixin: 'cemix:chainRedirect', fields: {pageSuccess: 'stored page'}},
        {mixin: 'cemix:chainSuccess', fields: {pageSuccess: 'stored page', toastSuccess: 'stored toast'}}
    ].forEach(({mixin, fields}) => {
        it(`shows the stored fields when moving up the chain from cemix:chainPopin to ${mixin}`, () => {
            const contentEditor = edit('storedPopin');

            contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue(mixin);

            Object.entries(fields).forEach(([field, value]) => {
                contentEditor.getField(SmallTextField, `${mixin}_${field}`).checkValue(value);
            });

            contentEditor.cancelAndDiscard();
        });
    });

    it('applies exactly the selected member and keeps the stored value when moving up the chain', () => {
        const contentEditor = edit('storedPopinUp');
        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainRedirect');
        contentEditor.save();

        appliedMixins('storedPopinUp').should('equal', 'cemix:chainRedirect');

        cy.log('pageSuccess belongs to cemix:chainRedirect, which the node still carries, so reopening shows it');
        const reopened = edit('storedPopinUp');
        reopened.getField(SmallTextField, 'cemix:chainRedirect_pageSuccess').checkValue('stored page');
        reopened.cancel();
    });

    // Same move to a member that declares a property itself: cemix:chainSuccess declares
    // toastSuccess, so the editor reads its copy as unchanged and must still write it back after the
    // removal of cemix:chainPopin has dropped it.
    it('keeps the stored values when moving up the chain to a member that declares one of them', () => {
        addNode({
            parentPathOrId: contents,
            name: 'storedPopinUpSuccess',
            primaryNodeType: 'cent:actionTest',
            ...STORED_POPIN
        });
        const contentEditor = edit('storedPopinUpSuccess');
        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainSuccess');
        contentEditor.save();

        appliedMixins('storedPopinUpSuccess').should('equal', 'cemix:chainSuccess');

        const reopened = edit('storedPopinUpSuccess');
        reopened.getField(SmallTextField, 'cemix:chainSuccess_pageSuccess').checkValue('stored page');
        reopened.getField(SmallTextField, 'cemix:chainSuccess_toastSuccess').checkValue('stored toast');
        reopened.cancel();
    });

    // A property declared further up the chain is one property. Moving down the chain must carry
    // its stored value, exactly as #2764 made it carry between siblings, and keep it through a save.
    it('applies exactly the selected member and keeps the stored values when moving down the chain', () => {
        const contentEditor = edit('storedSuccessDown');
        contentEditor.getField(ChoiceListField, 'cent:actionTest_actionType').selectValue('cemix:chainPopin');

        cy.log('pageSuccess and toastSuccess were stored under cemix:chainSuccess; cemix:chainPopin inherits them');
        contentEditor.getField(SmallTextField, 'cemix:chainPopin_pageSuccess').checkValue('stored page');
        contentEditor.getField(SmallTextField, 'cemix:chainPopin_toastSuccess').checkValue('stored toast');
        contentEditor.getField(SmallTextField, 'cemix:chainPopin_titrePopin').addNewValue('new title');
        contentEditor.save();

        appliedMixins('storedSuccessDown').should('equal', 'cemix:chainPopin');

        cy.log('and they must still be stored after the save');
        const reopened = edit('storedSuccessDown');
        reopened.getField(SmallTextField, 'cemix:chainPopin_pageSuccess').checkValue('stored page');
        reopened.getField(SmallTextField, 'cemix:chainPopin_toastSuccess').checkValue('stored toast');
        reopened.getField(SmallTextField, 'cemix:chainPopin_titrePopin').checkValue('new title');
        reopened.cancel();
    });

    it('leaves the applied mixins alone on a save that keeps the selected member', () => {
        const contentEditor = edit('storedPopinNoop');
        contentEditor.getField(SmallTextField, 'cemix:chainPopin_titrePopin').addNewValue(' edited');
        contentEditor.save();

        appliedMixins('storedPopinNoop').should('equal', 'cemix:chainPopin');
    });
});
