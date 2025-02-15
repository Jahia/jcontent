import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';

describe('Create content tests', () => {
    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});

        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    describe('Content Folders creation', () => {
        let jcontent: JContent;
        beforeEach(() => {
            cy.loginAndStoreSession();
            JContent.visit('jcontentSite', 'en', 'content-folders/contents');
            jcontent = new JContent();
            jcontent.selectAccordion('content-folders');
        });

        it('Can create content in content folders', function () {
            JContent.visit('jcontentSite', 'en', 'content-folders/contents');
            jcontent = new JContent();
            jcontent.selectAccordion('content-folders');
            jcontent
                .getCreateContent()
                .open()
                .getContentTypeSelector()
                .selectContentType('jmix:basicContent')
                .selectContentType('jnt:bigText')
                .create();
        });
    });

    describe('Page Builder Creation', () => {
        const iframeSel = '[data-sel-role="page-builder-frame-active"]';
        let jcontent: JContentPageBuilder;
        beforeEach(() => {
            cy.loginAndStoreSession();
            jcontent = JContent
                .visit('jcontentSite', 'en', 'pages/home')
                .switchToPageBuilder();
        });

        it('Create content in page builder', () => {
            const buttons = jcontent.getModule('/sites/jcontentSite/home/landing').getCreateButtons();
            buttons.get().scrollIntoView();
            buttons.getButton('New content').click();
            const contentEditor = jcontent.getCreateContent().getContentTypeSelector().searchForContentType('jnt:bigText').selectContentType('jnt:bigText').create();
            contentEditor.getRichTextField('jnt:bigText_text').type('Newly created content');
            contentEditor.create();

            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2500);
            cy.iframe(iframeSel).find('p').first().then(el => {
                el.closest('html')[0].scroll(0, -2000);
                cy.iframe(iframeSel).find('p').first().should('contain.text', 'Newly created content');
            });
        });

        it.skip('Update newly created content', () => {
            jcontent = new JContentPageBuilder(new JContent());
            jcontent.getModule('/sites/jcontentSite/home/landing').get().scrollIntoView();
            jcontent.getModule('/sites/jcontentSite/home/landing/rich-text').doubleClick();
            const contentEditor = new ContentEditor();
            const richTextField = contentEditor.getRichTextField('jnt:bigText_text');
            richTextField.setData('Newly updated content');
            contentEditor.save();

            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2500);
            cy.iframe(iframeSel).find('p').first().then(el => {
                el.closest('html')[0].scroll(0, -2000);
                cy.iframe(iframeSel).find('p').first().should('contain.text', 'Newly updated content');
            });
        });

        it('Create content in page builder using insertion points', () => {
            const module = jcontent.getModule('/sites/jcontentSite/home/landing');
            module.click();
            const buttons = module.getCreateButtons();
            buttons.getFirstInsertionButton().click();
            const contentEditor = jcontent.getCreateContent().getContentTypeSelector().searchForContentType('jnt:bigText').selectContentType('jnt:bigText').create();
            contentEditor.getRichTextField('jnt:bigText_text').type('Newly inserted content');
            contentEditor.create();

            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2500);
            cy.iframe(iframeSel).find('p').first().then(el => {
                el.closest('html')[0].scroll(0, -2000);
                cy.iframe(iframeSel).find('p').should('contain.text', 'Newly inserted content');
            });
        });
    });
});
