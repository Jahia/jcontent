// Migrated from the legacy Selenium class FieldsValidationTest (Jahia/selenium#1678), FT-001 to FT-007.
// FT-008 to FT-013 live in fieldsValidation.cy.ts.

import {addNode, context, createSite, createUser, deleteUser, enableModule, getComponentBySelector, grantRoles, jfaker, Menu} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor, JContent} from '../../page-object';
import {ChoiceListField, PickerField, SmallTextField} from '../../page-object/fields';

// Every site and user of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'mandatoryFields';
const uniqueName = (kind: string) => `${prefix}${kind}${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;

const removeStaleFixtures = () => {
    cy.apollo({
        fetchPolicy: 'no-cache',
        query: gql`query staleFixtures($sites: String!, $users: String!) {
            jcr {
                sites: nodesByQuery(query: $sites) { nodes { name } }
                users: nodesByQuery(query: $users) { nodes { name } }
            }
        }`,
        variables: {
            sites: `SELECT * FROM [jnt:virtualsite] WHERE ISDESCENDANTNODE('/sites') AND LOCALNAME() LIKE '${prefix}%'`,
            users: `SELECT * FROM [jnt:user] WHERE LOCALNAME() LIKE '${prefix}%'`
        }
    }).then(result => {
        result.data.jcr.sites.nodes.forEach(({name}) => cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: name}));
        result.data.jcr.users.nodes.forEach(({name}) => deleteUser(name));
    });
};

const SINGLE = 'qant:allFieldsRequired';
const MULTIPLE = 'qant:allFieldsMultipleRequired';

// The fields of qant:allFieldsRequired (qa-module). The choicelists and the booleans hold a value when the
// create form opens, so they are never in error.
const SINGLE_FILLED_ON_OPEN = ['sharedChoicelist', 'choicelist', 'sharedBoolean', 'boolean'];
const SINGLE_EMPTY_ON_OPEN = [
    'sharedSmallText',
    'smallText',
    'sharedTextarea',
    'textarea',
    'sharedLong',
    'long',
    'sharedDouble',
    'double',
    'sharedWeakreference',
    'weakreference',
    'sharedBigtext',
    'bigtext',
    'date',
    'sharedDate',
    'decimal',
    'sharedDecimal',
    'uri',
    'sharedUri',
    'name',
    'sharedName',
    'path',
    'sharedPath'
];

// The fields of qant:allFieldsMultipleRequired. Only these seven have no default value in the definition.
const MULTIPLE_EMPTY_ON_OPEN = ['dynamicChoicelist', 'sharedWeakreference', 'weakreference', 'date', 'sharedDate', 'path', 'sharedPath'];
const MULTIPLE_FILLED_ON_OPEN = [
    'sharedChoicelist',
    'choicelist',
    'sharedSmallText',
    'smallText',
    'sharedTextarea',
    'textarea',
    'sharedLong',
    'long',
    'sharedDouble',
    'double',
    'sharedBoolean',
    'boolean',
    'sharedBigtext',
    'bigtext',
    'decimal',
    'sharedDecimal',
    'uri',
    'sharedUri',
    'name',
    'sharedName'
];

const fieldSelector = (type: string, field: string) => `[data-sel-content-editor-field="${type}_${field}"]`;

const expectBadge = (type: string, field: string, isActive: boolean) => {
    cy.get(fieldSelector(type, field)).find('[data-sel-content-editor-field-mandatory]')
        .should('have.attr', 'data-sel-content-editor-field-mandatory', String(isActive));
};

const editorBody = (type: string, field: string) => cy.get(`${fieldSelector(type, field)} iframe.cke_wysiwyg_frame`)
    .its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);

const openFieldMenu = (type: string, field: string, menuRole: string, actionRole: string) => {
    cy.get(fieldSelector(type, field)).scrollIntoView();
    cy.get(fieldSelector(type, field)).find(`[data-sel-role="${menuRole}"]`).click();
    getComponentBySelector(Menu, `#menuHolder ${Menu.defaultSelector}`).selectByRole(actionRole);
};

describe('Content Editor - mandatory fields', () => {
    const siteKey = uniqueName('site');
    const editor = uniqueName('editor');
    const password = 'password';
    const target = 'targetText';

    // Clicks Create, checks the save-error dialog, and closes it.
    const createWithErrors = (count?: number) => {
        new ContentEditor().createUnchecked();
        // The id names the title of the dialog, and the count is in its body.
        cy.get('#dialog-errorBeforeSave').should('be.visible');
        if (count !== undefined) {
            cy.get('#dialog-errorBeforeSave').closest('[role="dialog"]').should('contain', `There are ${count} validation errors in the form`);
        }

        new ContentEditor().discardErrorDialog();
        cy.get('#dialog-errorBeforeSave').should('not.exist');
    };

    const openCreateForm = (type: string) => {
        JContent.visit(siteKey, 'en', 'content-folders/contents').createContent(type);
        cy.get(fieldSelector(type, 'sharedPath')).should('exist');
    };

    const pickTarget = (type: string, field: string, isMultiple: boolean) => {
        const picker = new ContentEditor().getField(PickerField, `${type}_${field}`, isMultiple).open();
        picker.wait();
        const contentAccordion = picker.getAccordionItem('picker-content-folders');
        contentAccordion.click();
        picker.wait();
        picker.navigateTo(contentAccordion, 'contents');
        if (isMultiple) {
            // A multiple picker selects through the checkbox of the row.
            picker.getTable().getRowByName(target).get().find('[data-cm-role="table-content-list-cell-selection"] input').click();
            picker.getTable().getRowByName(target).get().find('[data-cm-role="table-content-list-cell-selection"] input')
                .should('have.attr', 'aria-checked', 'true');
        } else {
            picker.getTable().getRowByName(target).get().should('be.visible').click();
        }

        picker.select();
    };

    // How the editor fills and clears each field of qant:allFieldsRequired that the legacy test exercised,
    // plus the picker and the rich text that it left out.
    const singleFields: Record<string, {fill: () => void; clear: () => void; isEmptyOnOpen: boolean}> = {
        choicelist: {
            isEmptyOnOpen: false,
            fill: () => new ContentEditor().getField(ChoiceListField, `${SINGLE}_choicelist`).selectValue('choice2'),
            clear: () => openFieldMenu(SINGLE, 'choicelist', 'content-editor/field/Choicelist', 'unsetFieldActionChoiceList')
        },
        date: {
            isEmptyOnOpen: true,
            fill: () => {
                cy.get(`${fieldSelector(SINGLE, 'date')} input[type="text"]`).clear({force: true});
                cy.get(`${fieldSelector(SINGLE, 'date')} input[type="text"]`).type('01/15/2027 10:00', {force: true});
            },
            clear: () => cy.get(`${fieldSelector(SINGLE, 'date')} input[type="text"]`).clear({force: true})
        },
        smallText: {
            isEmptyOnOpen: true,
            fill: () => new ContentEditor().getField(SmallTextField, `${SINGLE}_smallText`).addNewValue('a value', true),
            clear: () => new ContentEditor().getField(SmallTextField, `${SINGLE}_smallText`).clearValue(true)
        },
        textarea: {
            isEmptyOnOpen: true,
            fill: () => cy.get(`${fieldSelector(SINGLE, 'textarea')} textarea`).type('a value', {force: true}),
            clear: () => cy.get(`${fieldSelector(SINGLE, 'textarea')} textarea`).clear({force: true})
        },
        weakreference: {
            isEmptyOnOpen: true,
            fill: () => pickTarget(SINGLE, 'weakreference', false),
            clear: () => openFieldMenu(SINGLE, 'weakreference', 'content-editor/field/Picker', 'unsetFieldActionPicker')
        },
        bigtext: {
            isEmptyOnOpen: true,
            fill: () => editorBody(SINGLE, 'bigtext').type('a value'),
            clear: () => editorBody(SINGLE, 'bigtext').type('{selectall}{backspace}')
        }
    };
    const SINGLE_ERRORS_ON_OPEN = SINGLE_EMPTY_ON_OPEN.length;

    before(() => {
        removeStaleFixtures();
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        createUser(editor, password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: target,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'The target of the pickers', language: 'en'}]
        });
    });

    beforeEach(() => {
        cy.login(editor, password);
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        deleteUser(editor);
    });

    it('shows an inactive required badge on every mandatory field when the create form opens', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'single', 'badge-inactive-on-open');
        openCreateForm(SINGLE);
        [...SINGLE_EMPTY_ON_OPEN, ...SINGLE_FILLED_ON_OPEN].forEach(field => expectBadge(SINGLE, field, false));
    });

    it('activates the required badge of every empty field on Create', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'single', 'badge-active-after-create');
        openCreateForm(SINGLE);
        createWithErrors(SINGLE_ERRORS_ON_OPEN);
        SINGLE_EMPTY_ON_OPEN.forEach(field => expectBadge(SINGLE, field, true));
        SINGLE_FILLED_ON_OPEN.forEach(field => expectBadge(SINGLE, field, false));
    });

    it('leaves another empty field in error when one mandatory field is filled', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'single', 'control-field-stays-active');
        openCreateForm(SINGLE);
        Object.entries(singleFields).forEach(([field, {fill, clear, isEmptyOnOpen}]) => {
            cy.log(`Fill ${field}`);
            fill();
            // A field that starts empty takes one error away. The choicelist already holds a value.
            createWithErrors(isEmptyOnOpen ? SINGLE_ERRORS_ON_OPEN - 1 : SINGLE_ERRORS_ON_OPEN);
            expectBadge(SINGLE, field, false);
            expectBadge(SINGLE, 'sharedPath', true);
            // Back to the state of the form when it opened, for the next field
            if (isEmptyOnOpen) {
                clear();
            }
        });
    });

    it('re-activates the badge of a filled mandatory field once it is cleared', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'single', 'cleared-field-active');
        openCreateForm(SINGLE);
        Object.entries(singleFields).forEach(([field, {fill, clear, isEmptyOnOpen}]) => {
            cy.log(`Fill, then clear ${field}`);
            fill();
            createWithErrors();
            expectBadge(SINGLE, field, false);
            clear();
            // The cleared choicelist adds an error to those of the form when it opened.
            createWithErrors(isEmptyOnOpen ? SINGLE_ERRORS_ON_OPEN : SINGLE_ERRORS_ON_OPEN + 1);
            expectBadge(SINGLE, field, true);
            if (!isEmptyOnOpen) {
                fill();
            }
        });
    });

    it('leaves another empty multiple-value field in error when one is filled', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'multiple', 'control-field-stays-active');
        openCreateForm(MULTIPLE);
        const addGenericValue = (field: string, value: string, tag: 'input' | 'textarea') => {
            cy.get(fieldSelector(MULTIPLE, field)).find('[data-sel-action="addField"]').click();
            cy.get(fieldSelector(MULTIPLE, field)).find(`[data-sel-content-editor-multiple-generic-field] ${tag}`).last()
                .type(value, {force: true});
        };

        const addChoice = () => {
            const choicelist = `${fieldSelector(MULTIPLE, 'choicelist')} .moonstone-dropdown`;
            cy.get(choicelist).click('right');
            cy.get('.moonstone-menu:not(.moonstone-hidden) .moonstone-menuItem[data-value="choice2"]').click();
            // Escape would close the create dialog too: a click on the overlay of the menu closes the menu alone.
            cy.get('div.moonstone-menu_overlay').click({force: true});
            cy.get('.moonstone-menu:not(.moonstone-hidden) .moonstone-menuItem[data-value="choice2"]').should('not.exist');
            cy.get(choicelist).should('contain', 'Choice 2');
        };

        const steps: {field: string; fill: () => void; isEmptyOnOpen: boolean}[] = [
            {field: 'choicelist', isEmptyOnOpen: false, fill: addChoice},
            {field: 'smallText', isEmptyOnOpen: false, fill: () => addGenericValue('smallText', 'a=b', 'input')},
            {field: 'textarea', isEmptyOnOpen: false, fill: () => addGenericValue('textarea', 'a value', 'textarea')},
            {field: 'date', isEmptyOnOpen: true, fill: () => addGenericValue('date', '01/15/2027 10:00', 'input')},
            {field: 'weakreference', isEmptyOnOpen: true, fill: () => pickTarget(MULTIPLE, 'weakreference', true)}
        ];
        steps.forEach(({field, fill, isEmptyOnOpen}) => {
            cy.log(`Add a value to ${field}`);
            fill();
            createWithErrors();
            expectBadge(MULTIPLE, 'sharedPath', true);
            if (isEmptyOnOpen) {
                expectBadge(MULTIPLE, field, false);
            }
        });
    });

    it('re-activates the badge of a multiple-value field once every value is removed', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'multiple', 'cleared-field-active');
        openCreateForm(MULTIPLE);
        const fills: Record<string, () => void> = {
            date: () => {
                cy.get(fieldSelector(MULTIPLE, 'date')).find('[data-sel-action="addField"]').click();
                cy.get(fieldSelector(MULTIPLE, 'date')).find('[data-sel-content-editor-multiple-generic-field] input').last()
                    .type('01/15/2027 10:00', {force: true});
            },
            weakreference: () => pickTarget(MULTIPLE, 'weakreference', true)
        };
        Object.entries(fills).forEach(([field, fill]) => {
            cy.log(`Add, then remove every value of ${field}`);
            fill();
            createWithErrors();
            expectBadge(MULTIPLE, field, false);
            cy.get(fieldSelector(MULTIPLE, field)).find('[data-sel-action="removeField_0"]').click({force: true});
            createWithErrors(MULTIPLE_EMPTY_ON_OPEN.length);
            expectBadge(MULTIPLE, field, true);
        });
    });

    it('activates on Create the badge of every multiple-value field without a default value', () => {
        context.tag('testrail-case-1811954', 'mandatory-badge', 'multiple', 'badge-active-after-create');
        openCreateForm(MULTIPLE);
        [...MULTIPLE_EMPTY_ON_OPEN, ...MULTIPLE_FILLED_ON_OPEN].forEach(field => expectBadge(MULTIPLE, field, false));
        createWithErrors(MULTIPLE_EMPTY_ON_OPEN.length);
        MULTIPLE_EMPTY_ON_OPEN.forEach(field => expectBadge(MULTIPLE, field, true));
        MULTIPLE_FILLED_ON_OPEN.forEach(field => expectBadge(MULTIPLE, field, false));
    });
});
