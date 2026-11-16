import {addNode, Button, createSite, deleteNode, deleteSite, getComponentBySelector} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent} from '../../page-object';

describe('Bulk actions: tag, categorize, replace a value', () => {
    const siteKey = 'bulkActionsSite';
    const categoriesPath = '/sites/systemsite/categories';
    const names = ['bulk-a', 'bulk-b', 'bulk-c'];
    const paths = names.map(name => `/sites/${siteKey}/contents/${name}`);

    const visitAndSelect = (selected: string[]) => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        selected.forEach(name => jcontent.getTable().selectRowByName(name));
        return jcontent;
    };

    const openBulkEntry = (key: string) => {
        cy.get('.moonstone-loader').should('not.exist');
        getComponentBySelector(Button, '.moonstone-header button[data-sel-role="bulkActionsMenu"]').click();
        cy.get(`li[data-sel-role="${key}"]`).should('be.visible').click();
    };

    // Asks only what the property holds: `value` on a multiple property, or `refNodes` on a
    // non-reference one, is an error for the server.
    const read = (property: string, kind: 'value' | 'values' | 'refs') => {
        const selections = {value: 'value', values: 'values', refs: 'refNodes { name }'};
        return cy.apollo({
            query: gql(`query($paths: [String!]!, $property: String!) {
                jcr { nodesByPath(paths: $paths) { name property(name: $property, language: "en") { ${selections[kind]} } } }
            }`),
            variables: {paths, property},
            fetchPolicy: 'no-cache'
        }).its('data.jcr.nodesByPath').then(nodes => Object.fromEntries(nodes.map(node => {
            if (kind === 'refs') {
                return [node.name, (node.property?.refNodes || []).map(ref => ref.name)];
            }

            return [node.name, node.property?.[kind] ?? null];
        })));
    };

    const chooseMode = (fieldKey: string, mode: string) => {
        cy.get(`#bulk-values-mode-${fieldKey}-${mode}`).check({force: true});
    };

    // As a user does it: click the field, type, wait for the option that creates the tag to be
    // visible - not cut off by the body of the dialog - and press Enter.
    const addTag = (tag: string) => {
        cy.get('[data-sel-role="bulk-values-picker"]').contains('Type to add tag').click();
        cy.focused().type(tag, {delay: 100});
        cy.get('[id^="react-select-"][id*="-option-"]', {timeout: 10000}).contains(tag).should('be.visible');
        cy.focused().type('{enter}');
        cy.get('[data-sel-role="bulk-values-picker"]').should('contain', tag);
    };

    const apply = (fieldKey: string) => {
        cy.get('[data-sel-role="bulk-values-apply"]').should('not.be.disabled').click();
        cy.get(`[data-sel-role="bulk-values-dialog-${fieldKey}"]`).should('not.exist');
    };

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        names.forEach(name => addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: `<p>${name}</p>`, language: 'en'}]
        }));
        addNode({
            parentPathOrId: categoriesPath,
            name: 'bulkcatone',
            primaryNodeType: 'jnt:category',
            properties: [{name: 'jcr:title', language: 'en', value: 'bulkcatone'}]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        deleteNode(`${categoriesPath}/bulkcatone`);
        cy.logout();
    });

    it('adds a tag to every selected item', () => {
        visitAndSelect(names);
        openBulkEntry('bulkTag');
        chooseMode('tag', 'add');
        addTag('bulkadd');
        apply('tag');

        read('j:tagList', 'values').should('deep.equal', {'bulk-a': ['bulkadd'], 'bulk-b': ['bulkadd'], 'bulk-c': ['bulkadd']});
    });

    it('replaces the tags of two items and leaves the third one alone', () => {
        visitAndSelect(names.slice(0, 2));
        openBulkEntry('bulkTag');
        chooseMode('tag', 'replace');
        addTag('bulkreplaced');
        apply('tag');

        read('j:tagList', 'values').should('deep.equal', {'bulk-a': ['bulkreplaced'], 'bulk-b': ['bulkreplaced'], 'bulk-c': ['bulkadd']});
    });

    it('removes a tag', () => {
        visitAndSelect(names);
        openBulkEntry('bulkTag');
        chooseMode('tag', 'remove');
        addTag('bulkadd');
        apply('tag');

        read('j:tagList', 'values').should('deep.equal', {'bulk-a': ['bulkreplaced'], 'bulk-b': ['bulkreplaced'], 'bulk-c': null});
    });

    it('adds a category to every selected item', () => {
        visitAndSelect(names);
        openBulkEntry('bulkCategorize');
        chooseMode('categorize', 'add');
        cy.get('[data-sel-role="bulk-values-picker"] [data-sel-role="choice-tree"]').should('be.visible').click();
        cy.get('[data-sel-role="choice-tree"] menu').contains('li', 'bulkcatone').find('[role="checkbox"]').should('be.visible').click();
        cy.get('body').type('{esc}');
        apply('categorize');

        read('j:defaultCategory', 'refs').should('deep.equal', {'bulk-a': ['bulkcatone'], 'bulk-b': ['bulkcatone'], 'bulk-c': ['bulkcatone']});
    });

    it('replaces the value of a field on every selected item', () => {
        visitAndSelect(names);
        openBulkEntry('bulkReplaceValue');
        cy.get('[data-sel-role="bulk-replace-dialog"]').should('be.visible');
        cy.get('[data-sel-role="bulk-replace-field"]').click();
        cy.get('.moonstone-menu:not(.moonstone-hidden) li').contains('text').click();
        cy.get('#bulk-replace-value').type('replaced', {force: true});
        cy.get('[data-sel-role="bulk-replace-language"]').should('be.visible');
        cy.get('[data-sel-role="bulk-replace-apply"]').should('not.be.disabled').click();
        cy.get('[data-sel-role="bulk-replace-dialog"]').should('not.exist');

        read('text', 'value').should('deep.equal', {'bulk-a': 'replaced', 'bulk-b': 'replaced', 'bulk-c': 'replaced'});
    });

    it('does not offer the bulk actions for a content folder', () => {
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'bulk-folder', primaryNodeType: 'jnt:contentFolder'});
        visitAndSelect(['bulk-folder']);
        cy.get('.moonstone-loader').should('not.exist');
        cy.get('.moonstone-header button[data-sel-role="bulkActionsMenu"]').should('not.exist');
    });
});
