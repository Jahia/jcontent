import {createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../../page-object';

// The internal-link page picker (j:linknode) only renders as a picker once the dependentProperties
// handler has fetched its valueConstraints from the unsaved j:linkType value. Switching the editing
// language reloads the form from persisted state, so those client-computed constraints (and the
// addMixin fieldset placement) must be restored without a save (see #2447 regression).
describe('Language switch keeps dependent fields driven by unsaved changes', () => {
    const siteKey = 'langSwitchDependentFields';
    const linkTypeField = 'jnt:imageReferenceLink_j:linkType';
    const linknodeField = 'jmix:internalLink_j:linknode';

    const linknodeIsEditorialLinkPicker = () => {
        cy.get(`[data-sel-content-editor-field="${linknodeField}"]`, {timeout: 10000})
            .should('be.visible')
            .and('have.attr', 'data-sel-content-editor-field-picker-type', 'editoriallink');
    };

    before(() => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('keeps the internal link page picker when switching language without saving', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('jnt:imageReferenceLink');

        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('fieldConstraints')) {
                req.alias = 'fieldConstraints';
            }
        });

        contentEditor.getChoiceListField(linkTypeField).selectValue('internal');
        cy.wait('@fieldConstraints');
        linknodeIsEditorialLinkPicker();

        const pickerField = contentEditor.getPickerField(linknodeField);
        const picker = pickerField.open();
        picker.wait();
        picker.getTable().getRowByName('home').get().click();
        picker.select();
        pickerField.assertValue('Home');

        // Switch to French without saving: the unsaved link type must keep driving the picker
        contentEditor.getLanguageSwitcher().selectLangByValue('fr');
        cy.wait('@fieldConstraints');
        linknodeIsEditorialLinkPicker();
        contentEditor.getPickerField(linknodeField).assertValue('Home');

        // And survive the round trip back to English
        contentEditor.getLanguageSwitcher().selectLangByValue('en');
        cy.wait('@fieldConstraints');
        linknodeIsEditorialLinkPicker();
        contentEditor.getPickerField(linknodeField).assertValue('Home');

        contentEditor.cancelAndDiscard();
    });
});
