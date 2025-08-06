import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField} from '../../page-object/fields';

describe('ChoiceList initializers tests', () => {
    const siteKey = 'choiceListInitializerSite';
    const name = 'dependentProperties';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'cent:dependentProperties',
            properties: [
                {name: 'j:type', value: 'cent:contentRetrievalCETest'},
                {name: 'j:subNodesView', type: 'STRING', value: 'default'}
            ]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('should initialize choice list with a value', () => {
        const contentEditor = JContent.visit(siteKey, 'en', `content-folders/contents/${name}`).editContent();
        contentEditor.getField(ChoiceListField, 'cent:dependentProperties_j:type').assertSelected('contentRetrievalCETest');
        contentEditor.getField(ChoiceListField, 'jmix:renderableList_j:subNodesView').assertSelected('default');
        contentEditor.assertValidationErrorsNotExist();
    });
});
