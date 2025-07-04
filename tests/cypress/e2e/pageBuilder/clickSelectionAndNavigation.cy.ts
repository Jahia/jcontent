import {JContent, JContentPageBuilder} from '../../page-object';
import {addNode, deleteNode} from '@jahia/cypress';

describe('Page builder - navigation tests', () => {
    before(() => {
        addNode({
            parentPathOrId: '/sites/digitall/home',
            name: 'external-link',
            primaryNodeType: 'jnt:externalLink',
            properties: [{name: 'j:url', value: 'http://www.google.com'}]
        });

        addNode({
            parentPathOrId: '/sites/digitall/home',
            name: 'internal-link',
            primaryNodeType: 'jnt:nodeLink',
            properties: [
                {name: 'j:node', value: '/sites/digitall/home', type: 'REFERENCE'},
                {name: 'jcr:title', language: 'en', value: 'internal-xxx'}
            ]
        });
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteNode('/sites/digitall/home/external-link');
        deleteNode('/sites/digitall/home/internal-link');
    });

    it('Can unselect self', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        const contentPath = '/sites/digitall/home/area-main/highlights/our-companies';
        pageBuilder.getModule(contentPath).get().scrollIntoView();
        const module = pageBuilder.getModule(contentPath);
        module.getHeader(true).assertHeaderText('Our Companies');
        module.click();
        module.hasNoHeaderAndFooter();
    });

    it('Can use breadcrumbs to navigate up and down hierarchy', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        const contentPath = '/sites/digitall/home/area-main/highlights/our-companies';
        pageBuilder.getModule(contentPath).get().scrollIntoView();
        let module = pageBuilder.getModule(contentPath);
        module.getHeader(true).assertHeaderText('Our Companies');
        const breadcrumbs = module.getFooter().getItemPathDropdown();
        breadcrumbs.open();
        breadcrumbs.select('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights');
        module.getHeader().assertHeaderText('highlights');

        cy.log('Navigate back to the previous module');
        module = pageBuilder.getModule(contentPath);
        module.getHeader(true).assertHeaderText('Our Companies');
    });

    it('Click on links should open modal', () => {
        const jcontent = JContent
            .visit('digitall', 'en', 'pages/home')
            .switchToPageBuilder();
        jcontent.getSecondaryNav().get().find('[data-sel-role="home"] .moonstone-treeView_itemToggle').click();
        cy.contains('external-link').click();
        cy.contains('The link redirects to an external URL');
        cy.get('[data-sel-role="cancel-button"]').click();
        cy.contains('internal-xxx').click();
        cy.contains('The link redirects to Home');
        cy.get('[data-sel-role="cancel-button"]').click();
    });
});
