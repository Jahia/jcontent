import {createSite, deleteSite, jfaker} from '@jahia/cypress';
import {JContent} from '../../../page-object';

// A break of the inheritance in Edit roles applies to every role, edit and live, so both roles tabs show its state.
// Live roles cannot break it, so its text also names the Edit roles tab.
describe('Roles tabs - inheritance state', () => {
    const siteKey = 'rolesinherit' + jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true});
    const active = 'Inheritance is active for all roles (edit and live).';
    const broken = 'Inheritance is broken for all roles (edit and live).';
    const manage = 'Manage it in the Edit roles tab.';

    before(() => {
        createSite(siteKey, {templateSet: 'templates-system', serverName: 'localhost', locale: 'en', languages: 'en'});
    });

    after(() => {
        deleteSite(siteKey);
    });

    const editHome = () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        contentEditor.switchToAdvancedMode();
        return contentEditor;
    };

    it('shows that the inheritance is active in both roles tabs', () => {
        cy.login();
        editHome().openLiveRolesFromModesDropdown();
        cy.get('#JahiaGxtEditEnginePanel-liveroles', {timeout: 30000}).contains(`${active} ${manage}`).should('be.visible');

        editHome().openEditRolesFromModesDropdown();
        cy.get('#JahiaGxtEditEnginePanel-editroles', {timeout: 30000}).contains(active).should('be.visible');
    });

    it('shows in Live roles that the inheritance is broken after a break in Edit roles', () => {
        cy.login();
        editHome().openEditRolesFromModesDropdown();
        cy.get('#JahiaGxtEditEngineTabs button', {timeout: 30000}).contains('Break all inheritance').click();
        cy.get('button.x-btn-text').contains('Save').click();
        cy.get('#JahiaGxtEditEngineTabs').should('not.exist');

        editHome().openLiveRolesFromModesDropdown();
        cy.get('#JahiaGxtEditEnginePanel-liveroles', {timeout: 30000}).contains(`${broken} ${manage}`).should('be.visible');
    });
});
