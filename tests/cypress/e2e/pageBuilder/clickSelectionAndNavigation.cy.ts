import {JContent, JContentPageBuilder} from '../../page-object';
import {addNode, createSite, deleteNode, deleteSite} from '@jahia/cypress';

describe('Page builder - navigation tests', () => {
    const siteKey = 'pbNavigationTestSite';

    before(() => {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'landing',
            primaryNodeType: 'jnt:contentList',
            children: [{
                name: 'my-text',
                primaryNodeType: 'jnt:text',
                properties: [{ name: "text", language: "en", value: "my sample text" }]
            }]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'external-link',
            primaryNodeType: 'jnt:externalLink',
            properties: [{name: 'j:url', value: 'http://www.google.com'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'internal-link',
            primaryNodeType: 'jnt:nodeLink',
            properties: [
                {name: 'j:node', value: `/sites/${siteKey}/home`, type: 'REFERENCE'},
                {name: 'jcr:title', language: 'en', value: 'internal-xxx'}
            ]
        });
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
    });

    it('Can unselect self', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);

        const contentPath = `/sites/${siteKey}/home/landing/my-text`;
        const module = pageBuilder.getModule(contentPath, false);

        cy.log('Click on the module to show header');
        module.getHeader(true).assertHeaderText('my sample text');

        cy.log('Unclick the module');
        module.unclick();
        module.hasNoHeaderAndFooter();
    });

    it('Can use breadcrumbs to navigate up and down hierarchy', () => {
        const jcontent: JContent = JContent.visit(siteKey, 'en', 'pages/home');
        const pageBuilder: JContentPageBuilder = jcontent.switchToPageBuilder();

        const contentPath = `/sites/${siteKey}/home/landing/my-text`;
        let module = pageBuilder.getModule(contentPath, false);

        cy.log('Click on the module to show header');
        module.getHeader(true).assertHeaderText('my sample text');
        const breadcrumbs = module.getFooter().getItemPathDropdown();
        breadcrumbs.open();

        cy.log('Click on the breadcrumb to navigate up');
        breadcrumbs.select('landing');
        module = pageBuilder.getModule(`/sites/${siteKey}/home/landing`);
        module.getBox().getHeader().assertHeaderText('landing');
    });

    it('Click on links should open modal', () => {
        const jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
        const pagesAccordion = jcontent.getAccordionItem('pages');
        pagesAccordion.getTreeItem('home').expand();

        cy.log('Verify external link dialog');
        pagesAccordion.getTreeItem('external-link').click();
        cy.contains('The link redirects to an external URL');
        cy.get('[data-sel-role="cancel-button"]').click();

        cy.log('Verify internal link dialog');
        pagesAccordion.getTreeItem('internal-link').click();
        cy.contains('The link redirects to Home');
        cy.get('[data-sel-role="cancel-button"]').click();
    });
});
