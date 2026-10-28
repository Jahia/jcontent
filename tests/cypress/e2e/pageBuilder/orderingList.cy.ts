import {addNode, context, createSite, deleteNode, deleteSite} from '@jahia/cypress';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {ChoiceListField} from '../../page-object/fields';

describe('Page builder - ordering list', () => {
    const siteKey = 'listOrderingPageSite';
    const homePath = `/sites/${siteKey}/home`;
    const pageName = 'listOrderingPage';
    const pagePath = `${homePath}/${pageName}`;
    const areaPath = `${pagePath}/area-main`;
    const listPath = `${areaPath}/contributelist`;

    const items = [
        {name: 'bond', text: '007 is the real james bond'},
        {name: 'dc-cool', text: 'Washington DC is cool'},
        {name: 'dc-not-cool', text: 'Washington DC is not cool'},
        {name: 'bleus', text: 'Allez les bleus!'},
        {name: 'no-exist', text: '008 does not exist'},
        {name: 'abcdefgh', text: 'abcdefgh'},
        {name: 'punctuation', text: '!@#!@#!@#!@#'}
    ];
    const [bond, dcCool, dcNotCool, bleus, noExist, abcdefgh, punctuation] = items.map(item => item.name);

    const creationOrder = [bond, dcCool, dcNotCool, bleus, noExist, abcdefgh, punctuation];
    const textAscending = [punctuation, bond, noExist, abcdefgh, bleus, dcCool, dcNotCool];

    const optionLabels: Record<string, string> = {
        'jcr:created': 'Creation date',
        text: 'Text',
        asc: 'ascending',
        desc: 'descending'
    };

    const visitPageBuilder = (): JContentPageBuilder => JContent
        .visit(siteKey, 'en', `pages/home/${pageName}`)
        .switchToPageBuilder();

    const verifyOrder = (expected: string[]) => {
        const list = visitPageBuilder().getModule(listPath, false);
        list.get().scrollIntoView();
        list.get().find(`[jahiatype="module"][path^="${listPath}/"]:not([type="placeholder"])`).should($modules => {
            const names = [...$modules]
                .map(module => module.getAttribute('path').substring(listPath.length + 1))
                .filter(name => !name.includes('/'));
            expect(names).to.deep.equal(expected);
        });
    };

    const openListOrderingSection = (): ContentEditor => {
        visitPageBuilder().getModule(listPath, false).boxHeaderContextMenu().selectByRole('edit');

        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('listOrdering');
        return contentEditor;
    };

    const selectChoice = (contentEditor: ContentEditor, fieldName: string, value: string) => {
        const field = contentEditor.getField(ChoiceListField, fieldName);
        field.get().scrollIntoView();
        field.selectValue(value);
        field.assertSelected(optionLabels[value]);
    };

    // Each test starts from a list without jmix:orderedList, see beforeEach
    const enableAutomaticOrdering = () => {
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]')
            .find('input[type="checkbox"]')
            .should('not.be.checked')
            .click({force: true});
    };

    const moveItem = (contentEditor: ContentEditor, name: string, action: string) => {
        const item = () => contentEditor.getSection('listOrdering').get().find(`[data-handler-id]:has(#${name})`);
        item().scrollIntoView({offset: {left: 0, top: -100}});
        item().should('be.visible').realHover();
        item().find(`[data-sel-action^="${action}"]`).should('exist').click({force: true});
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });

        addNode({
            name: pageName,
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'List ordering test page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                // Rebuilt with its children before each test
                children: [{name: 'contributelist', primaryNodeType: 'jnt:contentList'}]
            }]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    // Rebuild the list before each test, so that it has no ordering and its children are in creation order.
    // One addNode per child, so that each child gets its own creation date.
    beforeEach(() => {
        deleteNode(listPath);
        addNode({name: 'contributelist', parentPathOrId: areaPath, primaryNodeType: 'jnt:contentList'});
        items.forEach(item => {
            addNode({
                name: item.name,
                parentPathOrId: listPath,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: item.text, language: 'en'}]
            });
        });
        cy.loginAndStoreSession();
    });

    it('renders the list in creation order when no ordering is configured', () => {
        context.tag('page-builder', 'list-ordering', 'default-order');
        verifyOrder(creationOrder);
    });

    it('reorders the list manually', () => {
        context.tag('page-builder', 'list-ordering', 'manual-ordering');
        const contentEditor = openListOrderingSection();

        moveItem(contentEditor, dcNotCool, 'moveToFirst');
        moveItem(contentEditor, dcCool, 'moveToLast');
        moveItem(contentEditor, punctuation, 'moveUp');
        moveItem(contentEditor, bond, 'moveDown');
        contentEditor.save();

        verifyOrder([dcNotCool, bleus, bond, noExist, punctuation, abcdefgh, dcCool]);
    });

    it('orders the list automatically by creation date, ascending', () => {
        context.tag('page-builder', 'list-ordering', 'automatic-ordering', 'date');
        // Without a manual order first, the creation order would pass without any ordering
        cy.apollo({
            mutationFile: 'jcontent/reorderChildren.graphql',
            variables: {pathOrId: listPath, names: [...creationOrder].reverse()}
        });
        verifyOrder([...creationOrder].reverse());
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'jcr:created');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'asc');
        contentEditor.save();

        verifyOrder(creationOrder);
    });

    it('orders the list automatically by creation date, descending', () => {
        context.tag('page-builder', 'list-ordering', 'automatic-ordering', 'date');
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'jcr:created');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'desc');
        contentEditor.save();

        verifyOrder([...creationOrder].reverse());
    });

    it('orders the list automatically by text, ascending', () => {
        context.tag('page-builder', 'list-ordering', 'automatic-ordering', 'text');
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'text');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'asc');
        contentEditor.save();

        verifyOrder(textAscending);
    });

    it('orders the list automatically by text, descending', () => {
        context.tag('page-builder', 'list-ordering', 'automatic-ordering', 'text');
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'text');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'desc');
        contentEditor.save();

        verifyOrder([...textAscending].reverse());
    });
});
