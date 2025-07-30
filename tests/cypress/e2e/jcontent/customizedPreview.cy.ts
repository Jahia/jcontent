import {
    Button,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    enableModule,
    getComponent,
    getComponentByRole,
    grantRoles,
    Menu
} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {CustomizedPreviewDialog} from '../../page-object/customizedPreviewDialog';

describe('Customized preview tests', () => {
    const siteKey = 'customizedPreviewTests';
    const user = {name: 'previewUser', password: 'password'};
    const path = 'pages/home';
    const previewParams = 'params=(openDialog:(key:customizedPreview,params:()))';

    before('setup', () => {
        createSite(siteKey);
        enableModule('channels', siteKey);
        createUser(user.name, user.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], user.name, 'USER');
        cy.loginAndStoreSession();
    });

    after('cleanup', () => {
        deleteUser(user.name);
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should show customized preview dialog in jcontent', () => {
        JContent.visit(siteKey, 'en', path);
        // @ts-expect-error window definition does not have "open" for some reason
        cy.window().then(win => cy.stub(win, 'open').as('winOpen'));

        getComponentByRole(Button, 'openInPreviewMenu').click();
        getComponent(Menu).selectByRole('customizedPreview');
        getComponent(CustomizedPreviewDialog).apply();

        // Verify call to window.open contains customized preview params
        cy.get('@winOpen').should('be.calledWith', Cypress.sinon.match(f => f.includes(previewParams)));
    });

    it.only('should display specified customized preview parameters', () => {
        JContent.visit(siteKey, 'en', `${path}?${previewParams}`);

        cy.log('should display customized preview without parameters');
        cy.get('iframe[data-sel-role="customized-preview-iframe"]')
            .should('be.visible')
            .invoke('attr', 'src')
            .should('not.include', '?')
            .and('not.include', 'alias')
            .and('not.include', 'channel')
            .and('not.include', 'variant');

        cy.log('should be able to change parameters within customized preview');
        getComponentByRole(Button, 'customizedPreview').click();
        let previewDialog = getComponent(CustomizedPreviewDialog);
        previewDialog.should('be.visible');
        previewDialog.selectUser(user.name);
        previewDialog.selectChannel('Tablet: iPad');
        previewDialog.selectVariant('Landscape');
        previewDialog.selectTodayDate();
        previewDialog.apply();

        cy.get('iframe[data-sel-role="customized-preview-iframe"]')
            .should('be.visible')
            .invoke('attr', 'src')
            .should('include', `alias=${user.name}`)
            .and('include', 'channel=apple_ipad_ver1')
            .and('include', 'variant=landscape')
            .and('include', 'prevdate');

        cy.get('[data-sel-role="customized-preview-header"]')
            .should('contain', user.name)
            .and('contain', 'Tablet: iPad (Landscape)');

        cy.log('should clear all parameters when clear all button is clicked');
        getComponentByRole(Button, 'customizedPreview').click();
        previewDialog = getComponent(CustomizedPreviewDialog);
        previewDialog.should('be.visible');
        previewDialog.clearAll();
        previewDialog.getUserSelector().should('have.attr', 'data-sel-media-picker', 'empty');
        previewDialog.apply();

        cy.get('iframe[data-sel-role="customized-preview-iframe"]')
            .should('be.visible')
            .invoke('attr', 'src')
            .should('not.include', '?')
            .and('not.include', 'alias')
            .and('not.include', 'channel')
            .and('not.include', 'variant')
            .and('not.include', 'prevdate');
    });
});
