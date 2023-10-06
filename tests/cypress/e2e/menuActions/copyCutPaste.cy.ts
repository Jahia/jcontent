import {JContent, JContentPageBuilder} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';
import {Collapsible, getComponentBySelector} from '@jahia/cypress';
import {ContentEditor} from '../../page-object/contentEditor';

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

        it('Editor can copy cut and paste with jcontent (metadata included)', () => {
            // Log in as editor
            cy.login('mathias', 'password');

            cy.log('Verify editor can copy/paste');
            let jcontent = JContent.visit('digitall', 'en', 'pages/home/our-companies/area-main/companies/all-movies/relatedPeople');
            jcontent.getTable().getRowByLabel('Taber').contextMenu().select('Copy');
            cy.get('#message-id').contains('Taber is in the clipboard');
            jcontent.getAccordionItem('Contents');
            jcontent = JContent.visit('digitall', 'en', 'pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
            jcontent.getTable().getRowByLabel('Sparks').should('be.visible');
            jcontent.getHeaderActionButton('paste').click();
            jcontent.getTable().getRowByLabel('Taber').should('be.visible');
            const ce = jcontent.editComponentByText('Taber');
            ce.openSection('Classification');
            cy.get('.moonstone-tag span').contains('Media').should('exist');
            const contentEditor = new ContentEditor();
            contentEditor.getLanguageSwitcher().select('Français');
            cy.get('.moonstone-tag span').contains('Média').should('exist');

            GraphqlUtils.deleteNode('/sites/digitall/home/our-companies/area-main/companies/all-sports/relatedPeople/daniel-taber');
            cy.logout();
        });
    });

    describe('Button presence', function () {
        beforeEach(function () {
            cy.login();
        });

        afterEach(function () {
            cy.logout();
        });

        it('Does not display paste as reference action on a page', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home');
            const item = jcontent.getAccordionItem('pages');
            item.expandTreeItem('home');
            item.getTreeItem('about').contextMenu().select('Copy');
            item.getTreeItem('newsroom').contextMenu().get().find('span').contains('Paste as reference').should('not.exist');
        });

        it('Should display paste action on a page', () => {
            const jcontent = JContent.visit('digitall', 'en', 'pages/home');
            const item = jcontent.getAccordionItem('pages');
            item.expandTreeItem('home');
            item.getTreeItem('about').contextMenu().select('Copy');
            item.getTreeItem('newsroom').contextMenu().get().find('span').contains('Paste').should('exist');
        });
    });
});
