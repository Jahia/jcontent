import {JContent} from '../../../page-object';
import {SmallTextField} from '../../../page-object/fields';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

// This test makes use of jmix_freezeSystemName.json form override from jcontent-test-module
describe('Extend Mixins tests with CE', () => {
    const siteKey = 'extendMixinsSite';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Applies extend mixin only if it is enabled on the node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages');
        let contentEditor = jcontent.editPage();
        const systemNameFieldSel = 'nt:base_ce:systemName';

        cy.log('Verify conditional override is not applied');
        let systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isNotReadOnly();

        cy.log('Enable the mixin');
        contentEditor.toggleOption('jmix:freezeSystemName');
        contentEditor.save();

        cy.log('Verify conditional override is applied after applying mixin');
        contentEditor = jcontent.editPage();
        systemNameField = contentEditor.getField(SmallTextField, systemNameFieldSel);
        systemNameField.isReadOnly();

        contentEditor.cancel();
    });
});
