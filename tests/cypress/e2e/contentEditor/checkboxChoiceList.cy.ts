import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {CheckboxChoiceList} from '../../page-object/fields/toggleChoiceList';

describe('Checkbox choice list - clear and reselect', () => {
    const siteKey = 'checkboxChoiceListSite';
    const contentName = 'Test Checkbox Content';

    const assertChecked = (label: string) => {
        cy.get(`input[name="checkboxChoiceList_checkboxes"][value="${label}"]`)
            .should('have.attr', 'aria-checked', 'true');
    };

    const assertNotChecked = (label: string) => {
        cy.get(`input[name="checkboxChoiceList_checkboxes"][value="${label}"]`)
            .should('have.attr', 'aria-checked', 'false');
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);

        addNode({
            name: contentName,
            parentPathOrId: `/sites/${siteKey}/contents`,
            primaryNodeType: 'cent:checkboxChoiceList',
            properties: [
                {name: 'jcr:title', value: 'Test Checkbox Content', language: 'en'},
                {name: 'checkboxes', values: ['choice1', 'choice2']}
            ]
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should clear checkboxes, reselect a value, save, then clear again and save', () => {
        // Step 1: Open the content for editing and verify initial state
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        let contentEditor = jcontent.editComponentByText(contentName);
        let field: CheckboxChoiceList = contentEditor.getField(
            CheckboxChoiceList, 'checkboxChoiceList_checkboxes', false
        );

        assertChecked('choice1');
        assertChecked('choice2');
        assertNotChecked('choice3');

        // Step 2: Clear all values using the context menu action
        field.contextMenu().select('Clear');
        assertNotChecked('choice1');
        assertNotChecked('choice2');
        assertNotChecked('choice3');

        // Step 3: Select a new value and save
        field.select('choice3');
        assertNotChecked('choice1');
        assertNotChecked('choice2');
        assertChecked('choice3');
        contentEditor.save();

        // Step 4: Reopen and verify the saved state
        contentEditor = jcontent.editComponentByText(contentName);
        field = contentEditor.getField(
            CheckboxChoiceList, 'checkboxChoiceList_checkboxes', false
        );

        assertNotChecked('choice1');
        assertNotChecked('choice2');
        assertChecked('choice3');

        // Step 5: Clear all values again and save
        field.contextMenu().select('Clear');
        assertNotChecked('choice1');
        assertNotChecked('choice2');
        assertNotChecked('choice3');
        contentEditor.save();

        // Step 6: Reopen and verify everything is cleared
        contentEditor = jcontent.editComponentByText(contentName);
        contentEditor.getField(
            CheckboxChoiceList, 'checkboxChoiceList_checkboxes', false
        );

        assertNotChecked('choice1');
        assertNotChecked('choice2');
        assertNotChecked('choice3');
    });
});

