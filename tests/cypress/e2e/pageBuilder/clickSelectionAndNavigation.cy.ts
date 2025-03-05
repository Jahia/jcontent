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
        const module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        module.click();
        module.hasNoHeaderAndFooter();
    });

    it('Can use breadcrumbs to navigate', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        let module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        const breadcrumbs = module.getFooter().getItemPathDropdown();
        breadcrumbs.open();
        breadcrumbs.select('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights');
        module.getHeader().assertHeaderText('highlights');
    });

    it('Can navigate up and down hierarchy', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages/home');
        const pageBuilder = new JContentPageBuilder(jcontent);
        let module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
        const breadcrumbs = module.getFooter().getItemPathDropdown();
        breadcrumbs.open();
        breadcrumbs.select('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights');
        module.getHeader().assertHeaderText('highlights');

        module = pageBuilder.getModule('/sites/digitall/home/area-main/highlights/our-companies');
        module.click();
        module.getHeader().assertHeaderText('Our Companies');
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
