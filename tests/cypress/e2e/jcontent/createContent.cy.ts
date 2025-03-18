import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Create content tests', () => {
    const siteKey = 'jcontentSite2';

    before(function () {
        createSite(siteKey);
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });

        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    describe('Content Folders creation', () => {
        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        it('Can create content in content folders', function () {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.selectAccordion('content-folders');
            jcontent.createContent('jnt:bigText').create();
        });
    });

    describe('Page Builder Creation', () => {
        const iframeSel = '[data-sel-role="page-builder-frame-active"]';
        let jcontent: JContentPageBuilder;
        beforeEach(() => {
            cy.loginAndStoreSession();
            jcontent = JContent
                .visit(siteKey, 'en', 'pages/home')
                .switchToPageBuilder();
        });

        it('Create content in page builder', () => {
            const buttons = jcontent.getModule(`/sites/${siteKey}/home/landing`).getCreateButtons();
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

        it('Update newly created content', () => {
            jcontent.getModule(`/sites/${siteKey}/home/landing`).get().scrollIntoView();
            jcontent.getModule(`/sites/${siteKey}/home/landing/rich-text`, false).doubleClick();
            // Jcontent.getModule(`/sites/${siteKey}/home/landing/rich-text`, false).contextMenu(true).selectByRole('edit');

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

        it.skip('Create content in page builder using insertion points', () => {
            const module = jcontent.getModule(`/sites/${siteKey}/home/landing`);
            module.click({force: true});
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
