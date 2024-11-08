import {JContent} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('Page header test', () => {
    before(() => {
        createSite('pageHeader', {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', 'pageHeader');
    });

    after(function () {
        deleteSite('pageHeader');
    });

    it('Check if the page headers are displayed in page builder', () => {
        cy.login();
        const jcontentPageBuilder = JContent.visit('pageHeader', 'en', 'pages/home')
            .switchToPageBuilder();
        jcontentPageBuilder.getPageHeaderList().items().should('have.length', 2);
        cy.logout();
    });
});
