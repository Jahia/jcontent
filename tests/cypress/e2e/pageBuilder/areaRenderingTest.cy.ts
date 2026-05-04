import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';

describe('Area rendering test', () => {
    const siteKey = 'areaRenderingTestSite';

    before(() => {
        createSite(siteKey, {
            templateSet: 'jcontent-test-js-template',
            serverName: 'localhost',
            locale: 'en'
        });

        addNode({
            name: 'testPage',
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'This is a test page', language: 'en'},
                {name: 'j:templateName', value: 'default'}
            ]
        });
    });

    after(function () {
        deleteSite(siteKey);
    });

    it('Allows to edit and create content in an absolute area with site and home page as parent', () => {
        cy.login();
        const jcontentPageBuilder = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
        cy.wait(10000);
    });
});
