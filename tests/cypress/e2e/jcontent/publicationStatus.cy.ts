import {JContent} from '../../page-object';
import {deleteNode} from '@jahia/cypress';

describe('Publication status badge test', () => {
    it('should show the last publisher, not the last editor', () => {
        cy.login('mathias', 'password');
        let jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        let ce = jcontent.createContent('jnt:text');
        ce.getSmallTextField('jnt:text_text').addNewValue('Test 1');
        cy.get('[data-sel-content-editor-fields-group="options"]').click();
        ce.getSmallTextField('nt:base_ce:systemName').addNewValue('test-text');
        ce.create();

        ce = jcontent.editComponentByText('Test 1');
        ce.getSmallTextField('jnt:text_text').addNewValue('Test 2');
        ce.save();

        cy.logout();
        cy.login('root', 'root1234');
        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        cy.get('[data-sel-role="publishAll"]').click();
        jcontent.clickPublishNow();

        cy.logout();
        cy.login('mathias', 'password');

        jcontent = JContent.visit('digitall', 'en', 'content-folders/contents');
        jcontent.getTable().getRowByLabel('Test 2')
            .should('contain.text', 'Published by root')
            .and('not.contain.text', 'Published by mathias');
    });
    afterEach(() => {
        deleteNode('/sites/digitall/contents/test-text');
        cy.logout();
    });
});
