import {JContent, JContentPageBuilder} from '../../page-object';
import {ContentEditor} from '../../page-object';

describe('Page builder', () => {
    let jcontent: JContentPageBuilder;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToPageBuilder();
    });

    describe('Selection tests', function () {
        const item1 = '/sites/jcontentSite/home/area-main/test-content4';
        const item2 = '/sites/jcontentSite/home/area-main/test-content5';
        const item3 = '/sites/jcontentSite/home/area-main/lookForMeTag';

        it('Selects and unselects one item when clicking outside the selected module', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            module.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
            jcontent.iframe(true).get().find('.wrapper').parent().parent().click('left', {timeout: 1000, force: true});
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Selects all items with meta key and deselect them with meta key', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item2);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module = jcontent.getModule(item3);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '3 items selected');

            // Unselect by clicking
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            module = jcontent.getModule(item2);
            module.click({metaKey: true});
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item1);
            module.click({metaKey: true});
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
        });

        it('Clears selection when unselected', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            module.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module.parentFrame.get().find('div[data-hovered="true"]').should('exist');

            jcontent.clearSelection();

            // For some reason clearing of selection does not refresh iframe contents in the test browser like it does
            // in a real one. So this test is not a complete one.
            jcontent.refresh();
            // Doesn't work: module.parentFrame.get().find('div[data-current="true"]').should('not.exist');
        });

        it('Allows to select with right click', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            let module = jcontent.getModule(item1);
            module.click();
            module.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            module = jcontent.getModule(item3);
            module.contextMenu().select('Add to selection');
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '2 items selected');

            jcontent.clearSelection();
        });

        it('Can use selection and refresh without issues', {retries: 5}, () => {
            // Tests https://jira.jahia.org/browse/BACKLOG-20987
            // Note that in some cases it may be possible to just refresh and not be able to select anything,
            // but it appears to be a different issue as we don't get 'language is required' exception from useNodeInfo
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item2);
            module.click();
            module.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');

            jcontent.clearSelection();
            // Jcontent.refresh();
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module3 = jcontent.getModule(item3);
            module3.click();
            module3.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
        });

        it('Opens Content Editor on double click', () => {
            cy.get('div[data-sel-role="selection-infos"]').should('not.exist');
            const module = jcontent.getModule(item1);
            module.click();
            module.getHeader().select();
            jcontent.getSelectionDropdown().get().find('span').should('have.text', '1 item selected');
            module.doubleClick();
            const contentEditor = new ContentEditor();
            contentEditor.getSmallTextField('jnt:event_jcr:title', false).get().should('exist');
            contentEditor.cancel();
        });
    });
});
