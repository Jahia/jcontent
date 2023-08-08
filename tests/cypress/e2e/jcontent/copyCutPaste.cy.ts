import {JContent} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';
import {Collapsible, getComponentBySelector, Menu} from '@jahia/cypress';
import {ContentEditor} from '../../page-object/contentEditor';

describe('Copy Cut and Paste tests with jcontent', () => {
    describe('Copy paste functionality', function () {
        const jcontent = new JContent();

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
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-movies/relatedPeople');
            jcontent.rightClickMenu('copy', 'Taber').then(() => {
                cy.get('#message-id').contains('Taber is in the clipboard');
            });
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
            jcontent.paste().then(() => {
                cy.get('td:contains("Taber")').should('exist');
                jcontent.rightClickMenu('edit', 'Taber').then(() => {
                    getComponentBySelector(Collapsible, '[data-sel-content-editor-fields-group="Classification"]').expand();
                    cy.get('.moonstone-tag span').contains('Media').should('exist');
                    const contentEditor = new ContentEditor();
                    contentEditor.getLanguageSwitcher().select('Français');
                    cy.get('.moonstone-tag span').contains('Média').should('exist');
                });

                GraphqlUtils.deleteNode('/sites/digitall/home/our-companies/area-main/companies/all-sports/relatedPeople/daniel-taber');
            });

            cy.log('Verify editor can cut/paste');
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-movies/relatedPeople');
            jcontent.rightClickMenu('cut', 'Taber').then(() => {
                cy.get('#message-id').contains('Taber is in the clipboard');
            });
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
            jcontent.paste().then(() => {
                cy.get('td:contains("Taber")').should('exist');

                // eslint-disable-next-line max-nested-callbacks
                jcontent.rightClickMenu('cut', 'Taber').then(() => {
                    cy.get('#message-id').contains('Taber is in the clipboard');
                });
                cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-movies/relatedPeople?params');
                jcontent.paste();
            });

            cy.logout();
        });

        it('Reviewer can\'t copy cut and paste in jcontent', () => {
            cy.login('irina', 'password');

            cy.log('Verify reviewer can\'t copy/paste');
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-movies/relatedPeople?params');
            jcontent.rightClickMenu('copy', 'Taber').then(() => {
                cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-sports/relatedPeople');
                jcontent.checkUserCanNotPaste();
            });

            cy.log('Verify reviewer can\'t cut');
            cy.visit('/jahia/jcontent/digitall/en/pages/home/our-companies/area-main/companies/all-movies/relatedPeople');
            jcontent.checkUserCanNotCut('Taber');

            cy.logout();
        });

        it('Test copy/cut/paste on folder', () => {
            cy.login();

            cy.visit('/jahia/jcontent/digitall/en/content-folders/contents?params');
            jcontent.rightClickMenu('copy', 'testFolder2').then(() => {
                cy.visit('/jahia/jcontent/digitall/en/content-folders/contents/testFolder1');
                // eslint-disable-next-line max-nested-callbacks
                jcontent.paste().then(() => {
                    cy.get('td:contains("testFolder2")').should('exist');
                    GraphqlUtils.deleteNode('/sites/digitall/contents/testFolder1/testFolder2');
                });
            });
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
