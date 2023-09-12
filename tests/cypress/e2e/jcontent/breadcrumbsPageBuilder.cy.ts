import {JContent, JContentPageBuilder} from '../../page-object';

describe('Breadcrumbs inside boxes of page builder', () => {
    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Verifies breadcrumbs are displayed and can be used to make selection', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = jcontent.switchToPageBuilder();
        const module = pageBuilder.getModule('/sites/digitall/home/landing/slider/innovating-technologies');
        module.hover();
        const breadcrumbs = module.getFooter().getBreadcrumbs();
        breadcrumbs.shouldHaveCount(3);
        breadcrumbs.select('landing');
        jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
    });

    it('Selects multiple elements', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = jcontent.switchToPageBuilder();
        const module = pageBuilder.getModule('/sites/digitall/home/landing/slider/innovating-technologies');
        module.hover();
        const breadcrumbs = module.getFooter().getBreadcrumbs();
        breadcrumbs.shouldHaveCount(3);
        breadcrumbs.select('landing');
        jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
        breadcrumbs.addToSelection('slider');
        jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');
    });
});
