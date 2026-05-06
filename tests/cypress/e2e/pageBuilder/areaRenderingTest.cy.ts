import {JContent, JContentPageBuilder} from '../../page-object';
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

        // Sometimes pagebuilder js is running a little behind and requires refreshing to see boxes, navigating to another page solves the issue
        let pageBuilder: JContentPageBuilder = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        pageBuilder = JContent.visit(siteKey, 'en', 'pages/home/testPage').switchToPageBuilder();
        let module = pageBuilder.getModule(`/sites/${siteKey}/aaSiteRootLinks`);
        module.getBox().getHeader().assertHeaderText('aaSiteRootLinks');
        module.click({force: true});
        module.getCreateButtons().should('have.length', 2);

        module = pageBuilder.getModule(`/sites/${siteKey}/home/aaHomeRootLinks`);
        module.getBox().getHeader().assertHeaderText('aaHomeRootLinks');
        module.click({force: true});
        module.getCreateButtons().should('have.length', 2);

        // Same areas should be visible and editable on the home page
        pageBuilder = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        module = pageBuilder.getModule(`/sites/${siteKey}/aaSiteRootLinks`);
        module.getBox().getHeader().assertHeaderText('aaSiteRootLinks');
        module.click({force: true});
        module.getCreateButtons().should('have.length', 2);

        module = pageBuilder.getModule(`/sites/${siteKey}/home/aaHomeRootLinks`);
        module.getBox().getHeader().assertHeaderText('aaHomeRootLinks');
        module.click({force: true});
        module.getCreateButtons().should('have.length', 2);
    });
});
