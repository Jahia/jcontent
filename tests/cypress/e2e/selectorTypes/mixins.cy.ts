import {JContent} from '../../page-object/jcontent';
import {ChoiceListField} from '../../page-object/fields';
import {
    addNode,
    enableModule
} from '@jahia/cypress';

describe('Test mixins', () => {
    let jcontent: JContent;
    const siteKey = 'mixinSite';

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'allFieldsDefaultValue',
            primaryNodeType: 'qant:AllFieldsDefault'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'textForMixins',
            primaryNodeType: 'jnt:text'
        });
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should activate mixin with default value', () => {
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('allFieldsDefaultValue');
        contentEditor.switchToAdvancedMode();

        // Activate Mixin extends default values
        cy.get('[data-sel-role-dynamic-fieldset="jmix:defaultPropMixinExtends"]')
            .find('input[type="checkbox"]')
            .click({force: true});
        cy.get('input[name="jmix:defaultPropMixinExtends_extendsMixinPropWithDefaultValue"]').should('have.value', 'value 1');
    });

    it('should add mixins to a page', () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        contentEditor.switchToAdvancedMode();

        contentEditor.toggleOption('jmix:theme', 'Theme');
        contentEditor.getField(ChoiceListField, 'jmix:theme_j:themeName').selectValue( 'green');

        contentEditor.toggleOption('qamix:mixin4', 'Mixin 4');
        cy.get('input[name="qamix:mixin4_mixin4Password"]').type('Mixin123');

        contentEditor.toggleOption('jdmix:alternateTitle', 'Alternate title');
        cy.get('input[name="jdmix:alternateTitle_alternateTitle"]').type('My alternate title');

        contentEditor.openSection('options');
        contentEditor.toggleOption('jmix:canBeUseAsTemplateModel', 'Page Model name');
        cy.get('input[name="jmix:canBeUseAsTemplateModel_j:pageTemplateTitle"]').type("Home template");

        // Remove some mixins
        contentEditor.toggleOption('jdmix:alternateTitle', 'Alternate title');
        contentEditor.toggleOption('qamix:mixin4', 'Mixin 4');

        // Modify theme
        contentEditor.getField(ChoiceListField, 'jmix:theme_j:themeName').selectValue( 'purple');
    });

    it('should display the mixins in the technical information', () => {
        const contentEditor = jcontent.editComponentByRowName('textForMixins');
        contentEditor.switchToAdvancedMode();

        contentEditor.openSection('options');
        contentEditor.toggleOption('jmix:topStory', 'Top story');
        contentEditor.toggleOption('jmix:geotagged', 'Geocoding');
        contentEditor.save();

        // Verify mixins are displayed in technical information
        contentEditor.switchToAdvancedOptions();
        cy.get('[data-sel-labelled-info="Full content type"]').should('contain', 'jnt:text; jmix:geotagged; jmix:topStory');
    });
});
