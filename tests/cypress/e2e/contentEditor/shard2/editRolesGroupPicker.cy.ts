import {context, createGroup, createSite, deleteSite, jfaker} from '@jahia/cypress';
import {JContent} from '../../../page-object';

// The group picker of the Edit roles tab offers the groups of the site being edited and the global
// groups, never the groups of another site.
describe('Edit roles - group picker', () => {
    const uniq = jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true});
    const siteKey = 'rolespicker' + uniq;
    const otherSiteKey = 'rolespickerother' + uniq;
    const siteGroup = 'pickersite' + uniq;
    const otherSiteGroup = 'pickerother' + uniq;

    before(() => {
        createSite(siteKey, {templateSet: 'templates-system', serverName: 'localhost', locale: 'en', languages: 'en'});
        createSite(otherSiteKey, {templateSet: 'templates-system', serverName: 'localhost', locale: 'en', languages: 'en'});
        createGroup(siteGroup, false, siteKey);
        createGroup(otherSiteGroup, false, otherSiteKey);
    });

    after(() => {
        deleteSite(siteKey);
        deleteSite(otherSiteKey);
    });

    it('FT-016: does not offer the group of another site', () => {
        context.tag('manage-groups', 'cross-site-role-picker');
        cy.login();
        const contentEditor = JContent.visit(siteKey, 'en', 'pages/home').editPage();
        contentEditor.switchToAdvancedMode();
        contentEditor.openEditRolesFromModesDropdown();

        cy.contains('.button-add-groups button', 'Add new groups', {timeout: 30000}).first().click();
        // The GXT toolbar clips the cells of the search field and its button, so Cypress reads both as
        // hidden although the dialog shows them
        cy.get('#JahiaGxtUserGroupSelect .indigo-search-input').type(uniq, {force: true});
        cy.get('#JahiaGxtUserGroupSelect .indigo-search-button button').click({force: true});

        // The group of the edited site matches the same search, so the absence below is not an empty result
        cy.contains('#JahiaGxtUserGroupSelect .x-grid3-row', siteGroup).should('be.visible');
        cy.contains('#JahiaGxtUserGroupSelect .x-grid3-row', otherSiteGroup).should('not.exist');

        cy.contains('#JahiaGxtUserGroupSelect button', 'Cancel').click();
    });
});
