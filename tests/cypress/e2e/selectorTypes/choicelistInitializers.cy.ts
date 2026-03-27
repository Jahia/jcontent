import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField} from '../../page-object/fields';

describe('ChoiceList initializers tests', () => {
    let jcontent: JContent;
    const siteKey = 'choiceListInitializerSite';
    const name = 'dependentProperties';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'cent:dependentProperties',
            properties: [
                {name: 'j:type', value: 'cent:contentRetrievalCETest'},
                {name: 'j:subNodesView', type: 'STRING', value: 'default'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'dependentChoicelist',
            primaryNodeType: 'qant:dependentChoicelist'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'dependentChoicelistMultiple',
            primaryNodeType: 'qant:dependentChoicelistMultiple'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'choicelistSimple',
            primaryNodeType: 'qant:choicelist'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'choicelistMultiple',
            primaryNodeType: 'qant:choicelist'
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

    it('should display dependent choicelists', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('dependentChoicelist');
        contentEditor.switchToAdvancedMode();

        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_countryDep').selectValue( 'france');
        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_regionDep').selectValue('ile-de-france');
        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_cityDep').selectValue('paris');

        // Modify region
        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_regionDep').selectValue('bretagne');
        contentEditor.getField(ChoiceListField,'qant:dependentChoicelist_cityDep').should('have.value', '');
        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_cityDep').selectValue('lancieux');

        // Modify country
        contentEditor.getField(ChoiceListField, 'qant:dependentChoicelist_countryDep').selectValue('england');
        contentEditor.getField(ChoiceListField,'qant:dependentChoicelist_regionDep').should('have.value', '');
        cy.get('#select-qant\\:dependentChoicelist_cityDep').should('have.attr', 'data-sel-content-editor-select-readonly', 'true');
    });

    it('should display dependent choicelists - multiple', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('dependentChoicelistMultiple');
        contentEditor.switchToAdvancedMode();

        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_countryDep', true).selectValues( ['france', 'england']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_regionDep', true).selectValues(['alsace', 'hampshire']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_cityDep', true).selectValues(['strasbourg', 'southampton']);

        // Reset region
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_regionDep', true).selectValues(['alsace', 'hampshire']);
        contentEditor.getField(ChoiceListField,'qant:dependentChoicelistMultiple_cityDep').should('have.value', '');
        cy.get('#qant\\:dependentChoicelistMultiple_cityDep').should('have.attr', 'data-sel-content-editor-select-readonly', 'true');

        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_regionDep', true).selectValues(['ile-de-france', 'dorset']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_cityDep', true).selectValues(['paris', 'bridport']);

        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_regionDep', true).selectValues(['bretagne', 'gloucestershire']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_cityDep', true).shouldHaveValues(['paris', 'nanterre', 'villejuif', 'weymouth', 'bournemouth', 'bridport', 'renne', 'lancieux', 'dinard', 'gloucester', 'stroud', 'bibury']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_cityDep', true).selectValues(['bibury', 'stroud']);
        contentEditor.getChoiceListField('qant:dependentChoicelistMultiple_cityDep', true).shouldHaveSelectedValues(['paris', 'bridport', 'bibury', 'stroud']);
    });

    it('should display dynamic fields', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('choicelistSimple');
        contentEditor.switchToAdvancedMode();

        cy.get('#select-qant\\:choicelist_j\\:linkType [role="listbox"]')
            .should('have.attr', 'aria-label', 'none');

        contentEditor.getField(ChoiceListField, 'qant:choicelist_j:linkType').selectValue( 'internal');
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]').should('exist');
        contentEditor.getField(ChoiceListField, 'qant:choicelist_j:linkType').selectValue( 'external');

        cy.get('input[name="jmix:externalLink_j:url"]').type('www.jahia.com');

        contentEditor.getField(ChoiceListField, 'qant:choicelist_j:linkType').selectValue( 'none');
        cy.get('input[name="jmix:externalLink_j:url"]').should('not.exist');
    });

    it('should display dynamic fields - multiple', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('choicelistMultiple');
        contentEditor.switchToAdvancedMode();

        cy.get('[id="qant:choicelist_j:linkTypeMultiple"]')
            .should('contain', 'none');

        contentEditor.getChoiceListField('qant:choicelist_j:linkTypeMultiple', true).selectValues( ['internal', 'external']);
        cy.get('[data-sel-content-editor-field="jmix:internalLink_j:linknode"]')
            .should('exist')
            .and('be.visible');
        cy.get('[data-sel-content-editor-field="jmix:externalLink_j:linkTitle"]')
            .should('exist')
            .and('be.visible');
    });

    it('should display dynamic mixins', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('qant:dynamicMixins');
        contentEditor.getField(ChoiceListField, 'qant:dynamicMixins_selectMixin').selectValue( 'mixin1');
        cy.get('input[name="qamix:mixin1_mixin1Field"]').should('exist').and('be.visible');

        contentEditor.getField(ChoiceListField, 'qant:dynamicMixins_selectMixin').selectValue( 'mixin3');
        cy.get('input[name="qamix:mixin3_mixin3Field"]').should('exist').and('be.visible');
        cy.get('#qamix\\:mixin3_mixin3Liste [role="listbox"]')
            .should('exist')
            .and('be.visible');
        contentEditor.create();

        jcontent.editComponentByRowName('dynamicmixins');
        contentEditor.switchToAdvancedMode();
        contentEditor.getField(ChoiceListField, 'qant:dynamicMixins_selectMixin').selectValue( 'mixin2');
        cy.get('input[name="qamix:mixin3_mixin3Field"]').should('not.exist');
        cy.get('#qamix\\:mixin3_mixin3Liste').should('not.exist');

        cy.get('[id="select-qamix:mixin2_mixin2Field"] [role="listbox"]')
            .should('exist')
            .and('be.visible');
        cy.get('[id="qamix:mixin2_mixin2Liste"] [role="listbox"]')
            .should('exist')
            .and('be.visible');
    });

    it('should display images in the choicelist', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('choicelistSimple');
        contentEditor.switchToAdvancedMode();

        cy.get('#select-qant\\:choicelist_imageList')
            .find('[role="listbox"]')
            .click();
        cy.get('.moonstone-menuItem[data-value="img1"] img')
            .should('have.attr', 'src')
            .and('include', 'img1.png');

        cy.get('.moonstone-menuItem[data-value="img2"] img')
            .should('have.attr', 'src')
            .and('include', 'img2.png');
        contentEditor.getField(ChoiceListField, 'qant:choicelist_imageList').selectValue( 'img2');
        contentEditor.getChoiceListField('qant:choicelist_imageList').assertSelected('Image 2');
    });
});
