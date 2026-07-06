import {ContentEditor, JContent, SidePanel} from '../../../page-object';
import {addNode} from '@jahia/cypress';

describe('Content editor side panel usages tab', () => {
    const ceSidePanel = new SidePanel().inCE();

    before(() => {
        cy.apollo({
            mutationFile: 'contentEditor/usages/createUsages.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents'
            }
        });
        addNode({
            parentPathOrId: '/sites/digitall/contents',
            name: 'side-panel-usages-empty-text',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'side-panel-usages-empty-text', language: 'en'}]
        });
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        cy.apollo({
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents/ce-usages-contents'
            }
        });
        cy.apollo({
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            variables: {
                pathOrId: '/sites/digitall/contents/side-panel-usages-empty-text'
            }
        });
    });

    it('displays the usages tab with the deduplicated list of usages', () => {
        const jcontent = JContent.visit('digitall', 'en', 'media/files/images/backgrounds');
        jcontent.switchToListMode().getTable().getRowByName('boy-father.jpg').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        ceSidePanel.getByRole('tab-usages').should('be.visible');
        ceSidePanel.switchToUsagesTab();

        ceSidePanel.getUsagesTable().should('be.visible');
        // 18 usages deduplicated to 16 rows (one usage is referenced in en/de/fr)
        ceSidePanel.getUsagesRows().should('have.length', 16);
        // The multi-language usage shows overflowing language chips (2 shown + '+1')
        ceSidePanel.getUsagesTable().should('contain.text', '+1');
    });

    it('displays the empty state when the content has no usages', () => {
        const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        jcontent.editComponentByRowName('side-panel-usages-empty-text');
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        ceSidePanel.switchToUsagesTab();
        ceSidePanel.getByRole('usages-empty').should('contain.text', 'No usages');
    });
});
