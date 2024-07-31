import {JContent, JContentPageBuilder} from '../../page-object';

describe('Page builder navigation tests', () => {
    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    it('Can unselect self', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        const module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        module.click();
        module.hasNoHeaderAndFooter();
    });

    it('Can use breadcrumbs to navigate', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        let module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        const breadcrumbs = module.getFooter().getBreadcrumbs();
        breadcrumbs.select('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights');
        module.getHeader().assertHeaderText('highlights');
    });

    it('Can navigate up and down hierarchy', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        let module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        const breadcrumbs = module.getFooter().getBreadcrumbs();
        breadcrumbs.select('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights');
        module.getHeader().assertHeaderText('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
    });
});
