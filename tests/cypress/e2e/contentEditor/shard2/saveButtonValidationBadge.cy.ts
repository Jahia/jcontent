import {ContentEditor} from '../../../page-object';
import {addNode, deleteSite, enableModule} from '@jahia/cypress';

describe('Content Editor - Save button with a validation warning badge', () => {
    const siteKey = 'saveButtonValidationBadge';
    const contentName = 'mandatoryFieldContent';
    const contentPath = `/sites/${siteKey}/contents/${contentName}`;
    const savePastille = '[data-sel-role="submitSave_pastille"]';

    before(() => {
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: siteKey});
        enableModule('qa-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: contentName,
            primaryNodeType: 'qant:constraints',
            properties: [
                {name: 'mandatorySharedSmallText', value: 'test'},
                {name: 'mandatoryRegexSharedSmallText', value: 'test'},
                {name: 'mandatorySmallText', value: 'test', language: 'en'},
                {name: 'mandatoryRegexSmallText', value: 'test', language: 'en'}
            ]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    afterEach(() => {
        cy.logout();
    });

    after(() => {
        deleteSite(siteKey);
    });

    it('saves in a single click when the Save button shows a validation warning badge', () => {
        // Open in French, where both i18n mandatory fields are empty → Save button shows the badge.
        const contentEditor = ContentEditor.visit(contentPath, siteKey, 'fr', 'content-folders/contents');

        // Precondition: the Save button warning badge is displayed.
        cy.get(savePastille).should('be.visible');

        // Fill every empty mandatory field. Validation runs on save (not on change), so the badge is
        // still shown at click time — the exact state that used to remount the button and eat the
        // first click.
        contentEditor.getSmallTextField('qant:constraints_mandatorySmallText').addNewValue('test');
        contentEditor.getSmallTextField('qant:constraints_mandatoryRegexSmallText').addNewValue('test');
        cy.get(savePastille).should('be.visible');

        // A SINGLE click must save. save() clicks submitSave once and asserts the success toast,
        // so on the buggy (remounting) button this times out; with the fix it passes.
        contentEditor.save();

        // The badge is gone once the content has been saved.
        cy.get(savePastille).should('not.exist');
    });
});
