import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../page-object';

describe('Page builder - drag scroll-edge indicator', () => {
    const siteKey = 'dragScrollEdgeIndicatorSite';
    const homePath = `/sites/${siteKey}/home`;
    const areaPath = `${homePath}/page-drag/area-main`;

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });

        addNode({
            name: 'page-drag',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Drag scroll edge indicator', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [
                    {
                        name: 'text-a',
                        primaryNodeType: 'jnt:text',
                        properties: [{name: 'text', value: 'AAA', language: 'en'}]
                    },
                    {
                        name: 'text-b',
                        primaryNodeType: 'jnt:text',
                        properties: [{name: 'text', value: 'BBB', language: 'en'}]
                    }
                ]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('shows a top and bottom edge indicator only while a drag is in progress', () => {
        const pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-drag')
            .switchToPageBuilder();

        const module = pageBuilder.getModule(`${areaPath}/text-a`);
        // A leaf existingNode module only renders its header once clicked (hover alone is not
        // enough). getHeader(true) does a plain click, which sets clickedElement but does not
        // push the node into the multi-selection array, so the drag source stays connected.
        const header = module.getHeader(true).get();

        // Nothing is being dragged yet: the edge indicators must not be rendered at all
        pageBuilder.iframe(true).get().find('[class*="scrollEdgeTop"]').should('not.exist');
        pageBuilder.iframe(true).get().find('[class*="scrollEdgeBottom"]').should('not.exist');

        const dataTransfer = new DataTransfer();
        header.trigger('dragstart', {dataTransfer, force: true});

        pageBuilder.iframe(true).get().find('[class*="scrollEdgeTop"]').should('be.visible');
        pageBuilder.iframe(true).get().find('[class*="scrollEdgeBottom"]').should('be.visible');

        header.trigger('dragend', {dataTransfer, force: true});

        pageBuilder.iframe(true).get().find('[class*="scrollEdgeTop"]').should('not.exist');
        pageBuilder.iframe(true).get().find('[class*="scrollEdgeBottom"]').should('not.exist');
    });
});
