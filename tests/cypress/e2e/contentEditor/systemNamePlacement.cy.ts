import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';

interface FormField {
    name: string;
    readOnly: boolean;
}

interface FormFieldSet {
    name: string;
    fields: FormField[];
}

interface FormSection {
    name: string;
    fieldSets: FormFieldSet[];
}

describe('System name placement in the editing form', () => {
    const siteKey = 'systemNamePlacementSite';
    let jcontent: JContent;

    const sectionsFragment = `
        sections {
            name
            fieldSets {
                name
                fields {
                    name
                    readOnly
                }
            }
        }
    `;

    const createFormQuery = gql`
        query createFormQuery($uuidOrPath: String!, $primaryNodeType: String!) {
            forms {
                form: createForm(primaryNodeType: $primaryNodeType, uiLocale: "en", locale: "en", uuidOrPath: $uuidOrPath) {
                    ${sectionsFragment}
                }
            }
        }
    `;

    const editFormQuery = gql`
        query editFormQuery($uuidOrPath: String!) {
            forms {
                form: editForm(uiLocale: "en", locale: "en", uuidOrPath: $uuidOrPath) {
                    ${sectionsFragment}
                }
            }
        }
    `;

    const getContentSection = (sections: FormSection[]) => sections.find(s => s.name === 'content');

    const assertNoSystemFieldSet = (sections: FormSection[]) => {
        sections.forEach(section => {
            expect(section.fieldSets.map(fs => fs.name), `section ${section.name}`).to.not.include('system');
        });
    };

    before(function () {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'my text'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-readonly-text',
            primaryNodeType: 'jnt:text',
            mixins: ['jmix:systemNameReadonly'],
            properties: [{name: 'text', language: 'en', value: 'my readonly text'}]
        });
    });

    after(function () {
        deleteSite(siteKey);
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('createForm places system name as first field of the content section for a type without jcr:title', () => {
        cy.apollo({
            query: createFormQuery,
            variables: {uuidOrPath: `/sites/${siteKey}/contents`, primaryNodeType: 'jnt:text'}
        }).then(response => {
            const sections: FormSection[] = response?.data?.forms?.form?.sections;
            const contentSection = getContentSection(sections);
            expect(contentSection.fieldSets[0].name).to.eq('jnt:text');
            expect(contentSection.fieldSets[0].fields[0].name).to.eq('ce:systemName');
            assertNoSystemFieldSet(sections);
        });
    });

    it('createForm places jcr:title first and system name second for a type with jcr:title', () => {
        cy.apollo({
            query: createFormQuery,
            variables: {uuidOrPath: `/sites/${siteKey}/contents`, primaryNodeType: 'cent:testTextField'}
        }).then(response => {
            const sections: FormSection[] = response?.data?.forms?.form?.sections;
            const contentSection = getContentSection(sections);
            expect(contentSection.fieldSets[0].name).to.eq('cent:testTextField');
            expect(contentSection.fieldSets[0].fields[0].name).to.eq('jcr:title');
            expect(contentSection.fieldSets[0].fields[1].name).to.eq('ce:systemName');
            assertNoSystemFieldSet(sections);
        });
    });

    it('editForm places system name as first field of the content section', () => {
        cy.apollo({
            query: editFormQuery,
            variables: {uuidOrPath: `/sites/${siteKey}/contents/my-text`}
        }).then(response => {
            const sections: FormSection[] = response?.data?.forms?.form?.sections;
            const contentSection = getContentSection(sections);
            expect(contentSection.fieldSets[0].name).to.eq('jnt:text');
            expect(contentSection.fieldSets[0].fields[0].name).to.eq('ce:systemName');
            assertNoSystemFieldSet(sections);
        });
    });

    it('editForm keeps a read-only system name at the top for jmix:systemNameReadonly content', () => {
        cy.apollo({
            query: editFormQuery,
            variables: {uuidOrPath: `/sites/${siteKey}/contents/my-readonly-text`}
        }).then(response => {
            const sections: FormSection[] = response?.data?.forms?.form?.sections;
            const contentSection = getContentSection(sections);
            const systemNameField = contentSection.fieldSets[0].fields[0];
            expect(systemNameField.name).to.eq('ce:systemName');
            expect(systemNameField.readOnly).to.eq(true);
            assertNoSystemFieldSet(sections);
        });
    });

    it('shows system name as first visible field when creating a type without jcr:title', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:text');
        cy.get('[data-sel-content-editor-fields-group="content"] [data-sel-content-editor-field]')
            .first()
            .should('have.attr', 'data-sel-content-editor-field', 'nt:base_ce:systemName')
            .find('input[type="text"]')
            .should('be.visible');
    });

    it('shows title first and system name right after when creating a type with jcr:title', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('cent:testTextField');
        cy.get('[data-sel-content-editor-fields-group="content"] [data-sel-content-editor-field]')
            .eq(0)
            .should('have.attr', 'data-sel-content-editor-field', 'cent:testTextField_jcr:title');
        cy.get('[data-sel-content-editor-fields-group="content"] [data-sel-content-editor-field]')
            .eq(1)
            .should('have.attr', 'data-sel-content-editor-field', 'nt:base_ce:systemName');
    });
});
