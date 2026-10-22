import {
    addNode,
    createSite,
    deleteSite,
    Dropdown,
    getComponent,
    getComponentBySelector,
    Menu
} from '@jahia/cypress';
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
        list.get().find(`[jahiatype="module"][path^="${listPath}/"]:not([type="placeholder"])`).then($modules => {
            const names = [...$modules]
                .map(module => module.getAttribute('path').substring(listPath.length + 1))
                .filter(name => !name.includes('/'));
            expect(names).to.deep.equal(expected);
        });
    };

    const openListOrderingSection = (): ContentEditor => {
        const list = visitPageBuilder().getModule(listPath, false);
        list.get().scrollIntoView();
        list.get().click('bottomLeft', {force: true});
        list.getBox().getHeader().get().should('be.visible').rightclick({force: true});
        getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)').selectByRole('edit');

        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.openSection('listOrdering');
        return contentEditor;
    };

    const selectChoice = (contentEditor: ContentEditor, fieldName: string, value: string) => {
        const field = contentEditor.getField(ChoiceListField, fieldName);
        field.get().scrollIntoView();
        field.get().should('be.visible');

        const dropdown = getComponent(Dropdown, field);
        dropdown.get().click('right');
        dropdown.get().find('.moonstone-menu').should('exist');
        dropdown.get().find(`.moonstone-menuItem[data-value="${value}"]`).should('exist').trigger('click', {force: true});
        field.assertSelected(optionLabels[value]);
    };

    const enableAutomaticOrdering = () => {
        cy.get('[data-sel-role-automatic-ordering="jmix:orderedList"]')
            .find('input[type="checkbox"]')
            .then($checkbox => {
                if (!$checkbox.is(':checked')) {
                    cy.wrap($checkbox).click({force: true});
                }
            });
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
                children: [{
                    name: 'contributelist',
                    primaryNodeType: 'jnt:contentList'
                }]
            }]
        });

        items.forEach(item => {
            addNode({
                name: item.name,
                parentPathOrId: listPath,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: item.text, language: 'en'}]
            });
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('renders the list in creation order when no ordering is configured', () => {
        verifyOrder(creationOrder);
    });

    it('reorders the list manually', () => {
        const contentEditor = openListOrderingSection();

        moveItem(contentEditor, dcNotCool, 'moveToFirst');
        moveItem(contentEditor, dcCool, 'moveToLast');
        moveItem(contentEditor, punctuation, 'moveUp');
        moveItem(contentEditor, bond, 'moveDown');
        contentEditor.save();

        verifyOrder([dcNotCool, bleus, bond, noExist, punctuation, abcdefgh, dcCool]);
    });

    it('orders the list automatically by creation date, descending', () => {
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'jcr:created');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'desc');
        contentEditor.save();

        verifyOrder([...creationOrder].reverse());
    });

    it('orders the list automatically by text, ascending', () => {
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'text');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'asc');
        contentEditor.save();

        verifyOrder(textAscending);
    });

    it('orders the list automatically by text, descending', () => {
        const contentEditor = openListOrderingSection();

        enableAutomaticOrdering();
        selectChoice(contentEditor, 'jmix:orderedList_firstField', 'text');
        selectChoice(contentEditor, 'jmix:orderedList_firstDirection', 'desc');
        contentEditor.save();

        verifyOrder([...textAscending].reverse());
    });
});
