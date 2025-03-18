import {JContent, JContentPageBuilder} from '../../page-object';

describe('Breadcrumbs inside boxes of page builder', () => {
    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Verifies breadcrumbs are displayed and can be used to make click selection of ancestor', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        const module = pageBuilder.getModule('/sites/digitall/home/landing/slider/innovating-technologies', false);
        module.click();
        const breadcrumbs = module.getFooter().getItemPathDropdown().open();
        breadcrumbs.shouldHaveCount(4); // Home, landing, slider, current item
        breadcrumbs.select('landing');
        pageBuilder.getModule('/sites/digitall/home/landing/slider/innovating-technologies').hasNoHeaderAndFooter();
    });
});
