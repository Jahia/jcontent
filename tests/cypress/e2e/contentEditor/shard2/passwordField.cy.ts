import {ContentEditor, JContent} from '../../../page-object';
import {addNode, createSite, createUser, deleteSite, deleteUser, grantRoles, jfaker} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('Password field', () => {
    const uniq = jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true});
    const siteKey = `passwordFieldSite${uniq}`;
    const editor = {username: `editor${uniq}`, password: 'password'};
    const secretField = 'cent:passwordFields_secret';
    const labelField = 'cent:passwordFields_label';

    const storedValuesQuery = gql`
        query storedPasswordValues($path: String!) {
            jcr {
                nodeByPath(path: $path) {
                    secret: property(name: "secret") {
                        decryptedValue
                    }
                    multiSecret: property(name: "multiSecret") {
                        decryptedValues
                    }
                }
            }
        }
    `;

    // Read as root
    const storedValues = (name: string) => {
        cy.apolloClient();
        return cy.apollo({query: storedValuesQuery, variables: {path: `/sites/${siteKey}/contents/${name}`}})
            .then(result => {
                const node = result?.data?.jcr?.nodeByPath;
                return {secret: node?.secret?.decryptedValue, multiSecret: node?.multiSecret?.decryptedValues};
            });
    };

    const addContent = (name: string) => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'cent:passwordFields',
            properties: [
                {name: 'label', value: 'first label'},
                {name: 'secret', value: 'stored secret', option: 'ENCRYPTED'},
                {name: 'multiSecret', values: ['stored one', 'stored two'], option: 'ENCRYPTED'}
            ]
        });
    };

    const editAsEditor = (name: string): ContentEditor => {
        cy.login(editor.username, editor.password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName(name).contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField(labelField).get().should('be.visible');
        return contentEditor;
    };

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editor.username);
    });

    it('keeps the stored values when an editor saves another field', () => {
        addContent('keep-values');
        const contentEditor = editAsEditor('keep-values');
        contentEditor.getSmallTextField(labelField).addNewValue('second label');
        contentEditor.save();
        cy.logout();

        storedValues('keep-values').should('deep.equal', {secret: 'stored secret', multiSecret: ['stored one', 'stored two']});
    });

    it('replaces the stored value with the value an editor types', () => {
        addContent('replace-value');
        const contentEditor = editAsEditor('replace-value');
        contentEditor.getSmallTextField(secretField).get().find('input').clear();
        contentEditor.getSmallTextField(secretField).get().find('input').type('typed secret');
        contentEditor.save();
        cy.logout();

        storedValues('replace-value').its('secret').should('equal', 'typed secret');
        storedValues('replace-value').its('multiSecret').should('deep.equal', ['stored one', 'stored two']);
    });
});
