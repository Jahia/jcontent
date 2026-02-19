import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, uploadFile} from '@jahia/cypress';

describe('Locate action', () => {
    let jcontent: JContent;
    const siteKey = 'jContentSite-locate';

    before('Add all needed data', () => {
        cy.login();
        createSite(siteKey);
        uploadFile(
            '/assets/uploadMedia/myfile.pdf',
            `/sites/${siteKey}/files`,
            'myfile.pdf',
            'application/pdf'
        );
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'page-ex',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'page-ex', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: 'rich-text-ex',
                    primaryNodeType: 'jnt:bigText',
                    properties: [{name: 'text', language: 'en', value: 'my example of richtext'}]
                }]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('Tests locate action', () => {
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        // Open search
        jcontent.getBasicSearch().openSearch().searchInWholeSite().searchTerm('example').executeSearch()
            .verifyResults(['myfile.pdf (Document1)']);

        // Open contextual menu and select locate
        jcontent.getTable().getRowByName('myfile.pdf')
            .contextMenu()
            .selectByRole('locate');

        // Verfiy we are redirected to media > thumbnails view
        jcontent.shouldBeInMode('Thumbnails');
        cy.get('h1').contains('files');
        jcontent.getGrid().getCardByName('myfile.pdf').should('be.visible');

        // Open again search
        jcontent.getBasicSearch().openSearch().searchInWholeSite().searchTerm('example').executeSearch()
            .verifyResults(['my example of richtext']);

        // Open contextual menu and select locate
        jcontent.getTable().getRowByName('rich-text-ex')
            .contextMenu()
            .selectByRole('locate');

        // Verfiy we are redirected to pages > page-ex
        cy.get('h1').contains('page-ex');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName('rich-text-ex').should('be.visible');
    });
});
