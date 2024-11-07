import {JContent} from '../../page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {GraphqlUtils} from '../../utils/graphqlUtils';

describe('Main resource menu display', () => {
    before(() => {
        createSite('mySite1');
        cy.apollo({mutationFile: 'jcontent/mainResource/createMainResource.graphql'});
    });

    after(() => {
        deleteSite('mySite1');
    });

    beforeEach(() => {
        cy.login();
    });

    it('Should not display main resource in menu', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getHeader().should('be.visible');
        jcontent.getAccordionItem('pages').expandTreeItem('home');
        jcontent.getAccordionItem('pages').shouldNotHaveTreeItem('test-event');
    });

    it('Should show event in menu', () => {
        GraphqlUtils.addMixins('/sites/mySite1/home/test-event', ['jmix:visibleInPagesTree'], ['jmix:visibleInPagesTree']);
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getHeader().should('be.visible');
        jcontent.getAccordionItem('pages').expandTreeItem('home');
        jcontent.getAccordionItem('pages').getTreeItem('test-event').should('be.visible');
    });

    it('Should not show event in menu', () => {
        GraphqlUtils.removeMixins('/sites/mySite1/home/test-event', ['jmix:visibleInPagesTree'], []);
        const jcontent = JContent.visit('mySite1', 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getHeader().should('be.visible');
        jcontent.getAccordionItem('pages').expandTreeItem('home');
        jcontent.getAccordionItem('pages').shouldNotHaveTreeItem('test-event');
    });

    it('Should not display event in content folders menu', () => {
        const jcontent = JContent.visit('mySite1', 'en', 'content-folders/contents');
        jcontent.getAccordionItem('content-folders').getHeader().should('be.visible');
        jcontent.getAccordionItem('content-folders').expandTreeItem('contents');
        jcontent.getAccordionItem('content-folders').shouldNotHaveTreeItem('test-event');
    });

    it('Should show event in menu', () => {
        GraphqlUtils.addMixins('/sites/mySite1/contents/test-event', ['jmix:visibleInContentTree'], ['jmix:visibleInContentTree']);
        const jcontent = JContent.visit('mySite1', 'en', 'content-folders/contents');
        jcontent.getAccordionItem('content-folders').getHeader().should('be.visible');
        jcontent.getAccordionItem('content-folders').expandTreeItem('contents');
        jcontent.getAccordionItem('content-folders').getTreeItem('test-event').should('be.visible');
    });

    it('Should not show event in menu', () => {
        GraphqlUtils.removeMixins('/sites/mySite1/contents/test-event', ['jmix:visibleInContentTree'], []);
        const jcontent = JContent.visit('mySite1', 'en', 'content-folders/contents');
        jcontent.getAccordionItem('content-folders').getHeader().should('be.visible');
        jcontent.getAccordionItem('content-folders').expandTreeItem('contents');
        jcontent.getAccordionItem('content-folders').shouldNotHaveTreeItem('test-event');
    });
});
