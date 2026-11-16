import {addNode, Button, createSite, deleteSite, enableModule, getComponentBySelector, Menu} from '@jahia/cypress';
import {JContent} from '../../page-object';

describe('Bulk actions menu: choice of entries', () => {
    const siteKey = 'bulkMenuChoiceSite';
    const bulkButton = '.moonstone-header button[data-sel-role="bulkActionsMenu"]';

    const openBulkMenu = (): Menu => {
        cy.get('.moonstone-loader').should('not.exist');
        getComponentBySelector(Button, bulkButton).click();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    };

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'choice-text',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: '<p>choice</p>', language: 'en'}]
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('lists every bulk action of the target when the accordion does not choose', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        jcontent.getTable().selectRowByName('choice-text');

        const menu = openBulkMenu();
        menu.shouldHaveItem('Test bulk action');
        menu.shouldHaveItem('Other test bulk action');
    });

    it('lists only the bulk actions that tableConfig.bulkActionKeys names', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'tableconfig-test/contents').switchToListMode();
        jcontent.getTable().selectRowByName('choice-text');

        openBulkMenu().shouldHaveItem('Test bulk action');
        cy.get('li[data-sel-role="otherTestBulkAction"]').should('not.exist');
    });
});
