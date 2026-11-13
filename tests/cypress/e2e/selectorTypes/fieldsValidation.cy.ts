// Migrated from the legacy Selenium class FieldsValidationTest (Jahia/selenium#1678), FT-008 to FT-013.
// FT-001 to FT-007 live in mandatoryFields.cy.ts, and an earlier part of the class in messageValidation.cy.ts.

import {addNode, context, createSite, createUser, deleteUser, enableModule, grantRoles, jfaker} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor} from '../../page-object';
import {RichTextField} from '../../page-object/fields';

// Every site and user of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'fieldsValidation';
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

// Noon, so that yesterday stays in the past and tomorrow in the future whatever the time of the run.
const noonInDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(12, 0, 0, 0);
    return date;
};

describe('Content Editor - field validation and help text', () => {
    const siteKey = uniqueName('site');
    const editor = uniqueName('editor');
    const password = 'password';
    const contentsPath = `/sites/${siteKey}/contents`;

    const futureDateField = 'qant:serverSideConstraint_futureDate';
    const futureDateMessage = 'The selected date should be in the future';
    const bigtextField = 'qant:allFields_bigtext';
    const missingFile = `/sites/${siteKey}/files/missing image.png`;

    const visit = (name: string) => ContentEditor.visit(`${contentsPath}/${name}`, siteKey, 'en', 'content-folders/contents');

    const saveYesterday = (ce: ContentEditor) => {
        ce.getDateField(futureDateField).addNewValue(noonInDays(-1), true);
        ce.saveUnchecked();
        cy.get(`[data-sel-content-editor-field="${futureDateField}"]`).should('contain', futureDateMessage);
    };

    // The legacy test typed the HTML in the source of the rich text. The CKEditor API (setData) does not
    // always reach the form, so the spec types in the source mode too, once the editor is ready.
    const saveBrokenLink = (ce: ContentEditor) => {
        const field = `[data-sel-content-editor-field="${bigtextField}"]`;
        const href = `/files/{workspace}${missingFile.replace(' ', '%20')}`;
        const html = `<p></p><div><img src="${href}" alt="missing"><a href="${href}">link</a></div><p></p>`;
        ce.getField(RichTextField, bigtextField).getEditor().its('status').should('eq', 'ready');
        cy.get(`${field} a.cke_button__source`).should('not.have.class', 'cke_button_disabled').click();
        cy.get(`${field} textarea.cke_source`).clear();
        cy.get(`${field} textarea.cke_source`).type(html, {parseSpecialCharSequences: false, delay: 0});
        cy.get(`${field} a.cke_button__source`).click();
        ce.saveUnchecked();
        cy.get(field).find('[data-sel-error="invalidLink"]').should('contain', `The link ${missingFile} is broken`);
    };

    before(() => {
        removeStaleFixtures();
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        createUser(editor, password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor, 'USER');
        addNode({parentPathOrId: contentsPath, name: 'futureDateRejected', primaryNodeType: 'qant:serverSideConstraint'});
        addNode({parentPathOrId: contentsPath, name: 'futureDateSaved', primaryNodeType: 'qant:serverSideConstraint'});
        addNode({parentPathOrId: contentsPath, name: 'brokenLinkRejected', primaryNodeType: 'qant:allFields'});
        addNode({parentPathOrId: contentsPath, name: 'brokenLinkFixed', primaryNodeType: 'qant:allFields'});
        addNode({
            parentPathOrId: contentsPath,
            name: 'helpText',
            primaryNodeType: 'qant:allFields',
            properties: [{name: 'sharedSmallText', value: 'Initial text'}]
        });
        addNode({parentPathOrId: contentsPath, name: 'mixinHelpText', primaryNodeType: 'qant:AllFieldsDefault'});
    });

    beforeEach(() => {
        cy.login(editor, password);
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        deleteUser(editor);
    });

    it('rejects a past date with the message of the server-side validator', () => {
        context.tag('testrail-case-2513125', 'server-validation', 'future-date-rejected');
        const ce = visit('futureDateRejected');
        ce.getDateField(futureDateField).checkEmpty();
        saveYesterday(ce);
    });

    it('saves a future date once the server-side validator rejected a past one', () => {
        context.tag('testrail-case-2513125', 'server-validation', 'future-date-saved');
        const ce = visit('futureDateSaved');
        saveYesterday(ce);
        ce.getDateField(futureDateField).addNewValue(noonInDays(1), true);
        ce.save();
    });

    it('reports a broken link of a rich text on the field', () => {
        context.tag('testrail-case-2513124', 'rich-text', 'broken-link-rejected');
        saveBrokenLink(visit('brokenLinkRejected'));
    });

    it('saves the rich text once the broken link is replaced', () => {
        context.tag('testrail-case-2513124', 'rich-text', 'broken-link-fixed-saved');
        const ce = visit('brokenLinkFixed');
        saveBrokenLink(ce);
        cy.get(`[data-sel-content-editor-field="${bigtextField}"] iframe.cke_wysiwyg_frame`)
            .its('0.contentDocument.body').should('not.be.empty').then(cy.wrap).type('{selectall}{backspace}a');
        ce.save();
    });

    it('shows the value and the help text of a field from its definition', () => {
        context.tag('testrail-case-2066073', 'field-helper', 'property-help-text');
        visit('helpText');
        cy.get('[data-sel-content-editor-field="qant:allFields_sharedSmallText"]').as('field');
        cy.get('@field').find('input[type="text"]').should('have.value', 'Initial text');
        cy.get('@field').should('contain', 'Help for sharedSmallText');
    });

    it('shows the help text of a mixin fieldset', () => {
        context.tag('testrail-case-2066073', 'field-helper', 'mixin-help-text');
        const ce = visit('mixinHelpText');
        ce.getDynamicFieldset('jmix:defaultPropMixinExtends').closest('article').should('contain', 'Help for defaultPropMixinExtends');
    });
});
