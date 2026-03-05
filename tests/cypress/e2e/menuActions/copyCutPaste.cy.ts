import {JContent} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';
import {addNode, createSite, deleteSite, Menu, uploadFile} from '@jahia/cypress';
import {addRestrictedPage} from '../../fixtures/jcontent/restrictions.gql.js';

describe('Copy Cut and Paste tests with jcontent', () => {
    const siteKey = 'copyCutPasteSite';

    describe('Copy paste functionality', function () {
        before('Add all needed metadata', () => {
            createSite(siteKey);
            uploadFile(
                '/assets/uploadMedia/myfile.pdf',
                `/sites/${siteKey}/files`,
                'myfile.pdf',
                'application/pdf'
            );
            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'My simple text',
                primaryNodeType: 'jnt:text'
            });
            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'ContentFolderA',
                primaryNodeType: 'jnt:contentFolder'
            });
            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'ContentFolderB',
                primaryNodeType: 'jnt:contentFolder'
            });
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
            deleteSite(siteKey);
        });

        it('Editor can copy cut and paste with jcontent', {retries: 3}, () => {
            // Log in as editor
            cy.login('mathias', 'password');
            cy.log('Verify editor can copy/paste');
            const jcontent = JContent.visit('digitall', 'en', 'pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
            jcontent.getTable().getRowByName('luanna-sparks').contextMenu().select('Copy');
            cy.get('#message-id').contains('Sparks is in the clipboard');
            jcontent.getAccordionItem('content-folders').click();
            jcontent.getAccordionItem('content-folders').getTreeItem('contents').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.editComponentByText('Sparks');
            GraphqlUtils.deleteNode('/sites/digitall/contents/luanna-sparks');
            cy.logout();
        });

        it('Can copy & paste a file', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'media/files');
            jcontent
                .getGrid()
                .getCardByName('myfile.pdf')
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').contains('myfile.pdf (Document1) is in the clipboard');
            jcontent.getAccordionItem('media').getTreeItem('bootstrap').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getGrid().getCardByName('myfile.pdf').should('be.visible');
        });

        it('Can cut & paste a file', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'media/files');
            jcontent
                .getGrid()
                .getCardByName('myfile.pdf')
                .contextMenu()
                .selectByRole('cut');
            cy.get('#message-id').contains('myfile.pdf (Document1) is in the clipboard');
            jcontent.getAccordionItem('media').getTreeItem('bootstrap').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getGrid().getCardByName('myfile.pdf').should('be.visible');
            // Go back to files to verify the file is gone
            jcontent.getAccordionItem('media').getTreeItem('files').click();
            cy.get(`[data-cm-role="grid-content-list-card"][data-sel-role-card="myfile.pdf"]`)
                .should('not.exist');
        });

        it('Can copy & paste a folder', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByName('ContentFolderA')
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').contains('ContentFolderA is in the clipboard');
            jcontent.getAccordionItem('content-folders').getTreeItem('ContentFolderB').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getTable().getRowByName('ContentFolderA').should('be.visible');
        });

        it('Can cut & paste a folder', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByName('ContentFolderA')
                .contextMenu()
                .selectByRole('cut');
            cy.get('#message-id').contains('ContentFolderA is in the clipboard');
            jcontent.getAccordionItem('content-folders').getTreeItem('ContentFolderB').click();
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getTable().getRowByName('ContentFolderA').should('be.visible');
            // Go back to contents to verify the folder is gone
            jcontent.getAccordionItem('content-folders').getTreeItem('contents').click();
            cy.get(`[data-cm-role="table-content-list-row"][data-node-name="myfile.pdf"]`)
                .should('not.exist');
        });

        it('Can copy & paste a folder in same folder', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByName('ContentFolderB')
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').contains('ContentFolderB is in the clipboard');
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getTable().getRowByName('ContentFolderB-1').should('be.visible');
        });

        it('Can clear clipboard', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByName('ContentFolderB')
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').contains('ContentFolderB is in the clipboard');
            jcontent.getHeaderActionButton('clearClipboard').click();
            cy.get('#message-id').contains('Clipboard successfully emptied');
        });

        it('Can copy & paste as reference', () => {
            cy.login();
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent
                .getTable()
                .getRowByName('My simple text')
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').contains('My simple text is in the clipboard');
            jcontent.getHeaderActionButton('pasteReference').click();
            cy.get('[data-node-name="My simple text-1"] [data-cm-role="table-content-list-cell-type"]')
                .should('contain', 'Content reference');
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
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(1000); // Wait for the context menu to stabilize
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
            jcontent.getTable().getRowByName('testText1').contextMenu().select('Cut');
            jcontent.getAccordionItem('content-folders').getTreeItem('testFolder2').contextMenu().shouldNotHaveItem('Paste as reference');
        });
    });

    // Template 'contentType' from 'jcontent-test-template' has an area content restriction of pbnt:contentRestriction
    // We have the same test in pageBuilder/restrictions as well for page builder
    describe('Template content type restriction', () => {
        const siteKey = 'restrictedStructuredSite';
        const pageName = 'myPage';

        function getRoleItem(menu: Menu, role: string) {
            menu.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`).scrollIntoView();
            return menu.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`);
        }

        before(() => {
            createSite(siteKey, {
                serverName: 'localhost',
                locale: 'en',
                templateSet: 'jcontent-test-template'
            });
            cy.apollo({mutation: addRestrictedPage(siteKey, pageName)});
            cy.loginAndStoreSession();
        });

        after(() => {
            cy.logout();
            deleteSite(siteKey);
        });

        it('should check restrictions when displaying paste button', () => {
            const jcontent = JContent
                .visit(siteKey, 'en', `pages/home/${pageName}`)
                .switchToPageBuilder()
                .switchToStructuredView();

            cy.log('disable button when not allowed');
            jcontent.getTable().getRowByName('notAllowedText').contextMenu().selectByRole('copy');
            cy.get('#message-id').contains('in the clipboard');
            let menu = jcontent.getTable().getRowByName('restricted-area').contextMenu();
            getRoleItem(menu, 'paste').should('be.visible').invoke('attr', 'aria-disabled').should('eq', 'true');
            getRoleItem(menu, 'pasteReference').should('be.visible').invoke('attr', 'aria-disabled').should('eq', 'true');
            menu.close();
            jcontent.clearClipboard();

            cy.log('enable button when allowed');
            jcontent.getTable().getRowByName('allowedText').contextMenu().selectByRole('copy');
            cy.get('#message-id').contains('in the clipboard');
            menu = jcontent.getTable().getRowByName('restricted-area').contextMenu();
            menu.shouldHaveRoleItem('paste');
            menu.shouldHaveRoleItem('pasteReference');
            menu.close();
        });
    });
});
