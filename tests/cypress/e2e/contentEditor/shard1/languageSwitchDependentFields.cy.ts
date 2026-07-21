import {createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../../page-object';

// Selecting link type 'internal' activates the jmix:internalLink mixin: the addMixin onChange
// handler places the j:linknode page picker into the form. Switching the editing language reloads
// the form from persisted state, so this client-side placement (and dependent valueConstraints in
// general) must be restored while the change is still unsaved (#2447 regression).
describe('Language switch keeps dependent fields driven by unsaved changes', () => {
    const siteKey = 'langSwitchDependentFields';
    const linkTypeField = 'jnt:imageReferenceLink_j:linkType';
    const linknodeField = 'jmix:internalLink_j:linknode';

    const linknodeIsVisible = () => {
        cy.get(`[data-sel-content-editor-field="${linknodeField}"]`, {timeout: 10000}).should('be.visible');
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

        // The form definition is refetched on every language switch; waiting on it anchors the
        // assertions after the reload, when the stale form is replaced (and the picker would be
        // lost without the fix).
        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('createForm')) {
                req.alias = 'createForm';
            }
        });

        const contentEditor = jcontent.createContent('jnt:imageReferenceLink');
        cy.wait('@createForm');

        contentEditor.getChoiceListField(linkTypeField).selectValue('internal');
        linknodeIsVisible();

        const pickerField = contentEditor.getPickerField(linknodeField);
        const picker = pickerField.open();
        picker.wait();
        picker.getTable().getRowByName('home').get().click();
        picker.select();
        pickerField.assertValue('Home');

        // Switch to French without saving: the unsaved link type must keep the picker in the form
        contentEditor.getLanguageSwitcher().selectLangByValue('fr');
        cy.wait('@createForm');
        linknodeIsVisible();
        contentEditor.getPickerField(linknodeField).assertValue('Home');

        // And survive the round trip back to English
        contentEditor.getLanguageSwitcher().selectLangByValue('en');
        cy.wait('@createForm');
        linknodeIsVisible();
        contentEditor.getPickerField(linknodeField).assertValue('Home');

        contentEditor.cancelAndDiscard();
    });
});
