import {addNode} from '@jahia/cypress';
import {JContent} from '../../page-object';

describe('Import action visibility on droppable content', {testIsolation: false}, () => {
    const siteKey = 'jContentSite-importDroppable';

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession(); // Edit in chief
        // Droppable container that accepts children but is none of the whitelisted types.
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-droppable',
            primaryNodeType: 'cent:droppableContainer'
        });
        // Non-droppable leaf content: import must stay hidden here.
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'my-non-droppable',
            primaryNodeType: 'cent:testTextField'
        });
    });

    after(function () {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    it('shows the import action on droppable content that accepts children', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('my-droppable').contextMenu().shouldHaveRoleItem('import');
    });

    it('does not show the import action on non-droppable content', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName('my-non-droppable').contextMenu().shouldNotHaveRoleItem('import');
    });
});
