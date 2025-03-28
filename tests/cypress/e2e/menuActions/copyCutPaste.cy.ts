import {JContent} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';

describe('Copy Cut and Paste tests with jcontent', () => {
    describe('Copy paste functionality', function () {
        before('Add all needed metadata', () => {
            // Add required mixins

            GraphqlUtils.addMixins('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', ['jmix:tagged', 'jmix:keywords', 'jmix:categorized'], ['jmix:tagged', 'jdmix:socialIcons', 'jmix:keywords', 'jmix:categorized']);
            // Set all required properties
            GraphqlUtils.setProperties('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:tagList', ['tag'], 'en');
            GraphqlUtils.setProperties('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:keywords', ['keyword'], 'en');
            GraphqlUtils.getNodeId('/sites/systemsite/categories/companies/media', 'category');
            cy.get('@category').then(categ => {
                GraphqlUtils.setProperties('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:defaultCategory', [`${categ}`], 'en');
            });

            // Set a category translation
            GraphqlUtils.setProperty('/sites/systemsite/categories/companies/media', 'jcr:title', 'Média', 'fr');

            // Create contentFolders
            GraphqlUtils.addNode('/sites/digitall/contents', 'jnt:contentFolder', 'testFolder1');
            GraphqlUtils.addNode('/sites/digitall/contents', 'jnt:contentFolder', 'testFolder2');
        });

        after('Delete metadata', () => {
            GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder1');
            GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder2');
            GraphqlUtils.deleteProperty('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:tagList', 'en');
            GraphqlUtils.deleteProperty('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:keywords', 'en');
            GraphqlUtils.deleteProperty('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', 'j:defaultCategory', 'en');
            GraphqlUtils.setProperty('/sites/systemsite/categories/companies/media', 'jcr:title', 'Media', 'fr');
            GraphqlUtils.removeMixins('/sites/digitall/home/our-companies/area-main/companies/all-movies/relatedPeople/daniel-taber', ['jmix:tagged', 'jmix:keywords', 'jmix:categorized'], ['jdmix:socialIcons']);
            GraphqlUtils.deleteNode('/sites/digitall/home/our-companies/area-main/companies/all-sports/relatedPeople/daniel-taber');
        });

        it('Editor can copy cut and paste with jcontent', () => {
            // Log in as editor
            cy.login('mathias', 'password');

            cy.log('Verify editor can copy/paste');
            const jcontent = JContent.visit('digitall', 'en', 'pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
            jcontent.getTable().getRowByLabel('Sparks').contextMenu().select('Copy');
            cy.get('#message-id').contains('Sparks is in the clipboard');
            jcontent.getAccordionItem('content-folders').click();
            jcontent.getAccordionItem('content-folders').getTreeItem('contents').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.editComponentByText('Sparks');
            GraphqlUtils.deleteNode('/sites/digitall/contents/luanna-sparks');
            cy.logout();
        });
    });

    describe('Button presence', function () {
        beforeEach(function () {
            cy.login();
            // Create contentFolders
            GraphqlUtils.addNode('/sites/digitall/contents', 'jnt:contentFolder', 'testFolder1');
            GraphqlUtils.addNode('/sites/digitall/contents', 'jnt:contentFolder', 'testFolder2');

            // Create a rich text
            GraphqlUtils.addNode('/sites/digitall/contents/testFolder1', 'jnt:bigText', 'testText1');
        });

        afterEach(function () {
            GraphqlUtils.deleteNode('/sites/digitall/home/newsroom/about');
            GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder1/testText1');
            GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder1');
            GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder2');
            cy.logout();
        });

        const copyPage = (jcontent: JContent, treeItem, copyActionName) => {
            const contextMenu = jcontent
                .getAccordionItem('pages')
                .getTreeItem(treeItem)
                .contextMenu();

            // There is some registry action pop-in that happens here that messes up with hover on Copy
            // Confirm they are visible before proceeding
            contextMenu.shouldHaveItem('New Page');
            contextMenu.shouldHaveItem('New...');
            const menu = contextMenu.submenu('Copy', 'jcontent-copyPageMenu');
            menu.should('be.visible');
            menu.select(copyActionName);
        };

        // Failing on hover to submenu but ok with other tests; skipping for now
        // https://github.com/Jahia/jcontent/actions/runs/13999630306/job/39203232919
        it.skip('Does not display paste as reference action on a page', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home/about');
            copyPage(jcontent, 'about', 'Page only');
            jcontent
                .getAccordionItem('pages')
                .getTreeItem('newsroom')
                .contextMenu()
                .shouldNotHaveItem('Paste as reference');
        });

        it('Should display paste action on a page', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home/about');
            copyPage(jcontent, 'about', 'Page with Sub-pages');
            jcontent
                .getAccordionItem('pages')
                .getTreeItem('newsroom')
                .contextMenu()
                .shouldHaveItem('Paste');
        });

        it('Should be able to copy single page', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home/about');
            copyPage(jcontent, 'about', 'Page only');

            const newsroomTreeItem = jcontent.getAccordionItem('pages').getTreeItem('newsroom');
            newsroomTreeItem.contextMenu().select('Paste');
            newsroomTreeItem.expand();
            cy.get('[role="treeitem"][data-sel-role=about]').should('have.length', 2);

            GraphqlUtils.getNode('/sites/digitall/home/newsroom/about').should('exist');
            GraphqlUtils.getNode('/sites/digitall/home/newsroom/about/history').should('not.exist');
        });

        it('Should not display paste as reference on cut content', () => {
            cy.login();
            const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents/testFolder1');
            jcontent.getTable().getRowByLabel('testText1').contextMenu().select('Cut');
            jcontent.getAccordionItem('content-folders').getTreeItem('testFolder2').contextMenu().shouldNotHaveItem('Paste as reference');
        });
    });
});
