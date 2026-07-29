import gql from 'graphql-tag';
import {addNode, createSite, createUser, deleteSite, deleteUser, enableModule, grantRoles} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {ChoiceListField} from '../../page-object/fields';

interface ValueConstraint {
    displayValue: string;
    value: { string: string };
}

describe('resourceBundle choicelist labels follow the editor UI locale', () => {
    const siteKey = 'rbChoicelistLocaleSite';
    const nodeName = 'rbChoicelist';
    const nodePath = `/sites/${siteKey}/contents/${nodeName}`;
    const frenchUser = 'rbChoicelistFrUser';

    const frLabels = {'text-start': 'Début', 'text-center': 'Centre', 'text-end': 'Fin'};
    const enLabels = {'text-start': 'Start', 'text-center': 'Center', 'text-end': 'End'};

    const editFormQuery = gql`
        query rbChoicelistEditForm($uiLocale: String!, $locale: String!, $path: String!) {
            forms {
                editForm(uiLocale: $uiLocale, locale: $locale, uuidOrPath: $path) {
                    sections {
                        fieldSets {
                            fields {
                                name
                                valueConstraints {
                                    displayValue
                                    value {
                                        string
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const fieldConstraintsQuery = gql`
        query rbChoicelistFieldConstraints($path: String, $parentPath: String!, $primaryNodeType: String!, $nodeType: String!, $fieldName: String!, $context: [InputContextEntryInput], $uiLocale: String!, $locale: String!) {
            forms {
                fieldConstraints(nodeUuidOrPath: $path, parentNodeUuidOrPath: $parentPath, primaryNodeType: $primaryNodeType, fieldNodeType: $nodeType, fieldName: $fieldName, context: $context, uiLocale: $uiLocale, locale: $locale) {
                    displayValue
                    value {
                        string
                    }
                }
            }
        }
    `;

    const getConstraints = (resp, fieldName: string): ValueConstraint[] => resp?.data?.forms?.editForm?.sections
        .flatMap(section => section.fieldSets)
        .flatMap(fieldSet => fieldSet.fields)
        .find(field => field.name === fieldName)
        ?.valueConstraints;

    const assertConstraints = (constraints: ValueConstraint[], expected: Record<string, string>) => {
        expect(constraints).to.have.length(Object.keys(expected).length);
        constraints.forEach(constraint => {
            expect(constraint.displayValue).to.eq(expected[constraint.value.string]);
        });
    };

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        createUser(frenchUser, 'password', [{name: 'preferredLanguage', value: 'fr'}]);
        grantRoles(`/sites/${siteKey}`, ['editor'], frenchUser, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: nodeName,
            primaryNodeType: 'cent:resourceBundleChoicelist'
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteUser(frenchUser);
        deleteSite(siteKey);
        cy.logout();
    });

    it('editForm resolves choicelist displayValues with the UI locale, not the content locale', () => {
        cy.apollo({
            query: editFormQuery,
            variables: {uiLocale: 'fr', locale: 'en', path: nodePath}
        }).should(resp => {
            assertConstraints(getConstraints(resp, 'captionAlignment'), frLabels);
        });

        cy.apollo({
            query: editFormQuery,
            variables: {uiLocale: 'en', locale: 'en', path: nodePath}
        }).should(resp => {
            assertConstraints(getConstraints(resp, 'captionAlignment'), enLabels);
        });
    });

    it('fieldConstraints resolves refetched displayValues with the UI locale, not the content locale', () => {
        cy.apollo({
            query: fieldConstraintsQuery,
            variables: {
                path: nodePath,
                parentPath: `/sites/${siteKey}/contents`,
                primaryNodeType: 'cent:resourceBundleChoicelist',
                nodeType: 'cent:resourceBundleChoicelist',
                fieldName: 'dependentChoice',
                context: [
                    {key: 'dependentProperties', value: 'mainChoice'},
                    {key: 'mainChoice', value: 'a'}
                ],
                uiLocale: 'fr',
                locale: 'en'
            }
        }).should(resp => {
            assertConstraints(resp?.data?.forms?.fieldConstraints, {x: 'Valeur X', y: 'Valeur Y'});
        });
    });

    it('shows option labels in the UI language when editing content in another language', () => {
        cy.login(frenchUser, 'password');
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName(nodeName);

        const field = contentEditor.getField(ChoiceListField, 'cent:resourceBundleChoicelist_captionAlignment');
        field.get().should('contain.text', 'Alignement');
        field.shouldHaveOptionLabels(frLabels);
    });

    it('keeps option labels in the UI language after a dependent choicelist refetch', () => {
        cy.login(frenchUser, 'password');
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName(nodeName);

        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('fieldConstraints')) {
                req.alias = 'fieldConstraints';
            }
        });

        // Changing mainChoice triggers a fieldConstraints refetch of dependentChoice's constraints
        contentEditor.getField(ChoiceListField, 'cent:resourceBundleChoicelist_mainChoice').selectValue('b');
        cy.wait('@fieldConstraints');

        contentEditor.getField(ChoiceListField, 'cent:resourceBundleChoicelist_dependentChoice')
            .shouldHaveOptionLabels({x: 'Valeur X', y: 'Valeur Y'});
    });
});
