import {contentTypes} from '../../fixtures/contentEditor/pickers/contentTypes';
import {JContent} from '../../page-object';

describe('Editorial picker tests', () => {
    const siteKey = 'digitall';
    let jcontent: JContent;

    beforeEach(() => {
        cy.login(); // Edit in chief

        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        cy.logout();
    });

    it('should open editorial picker with structured view as default', () => {
        const contentType = contentTypes.editorialpicker;
        jcontent
            .createContent(contentType.typeName)
            .getPickerField(contentType.fieldNodeType, contentType.multiple)
            .open();

        cy.get('div[data-sel-type="editorial"] div[data-sel-role="sel-view-mode-dropdown"] > div[role="dropdown"] > span')
            .should('have.text', 'Structured')
            .should('not.have.text', 'List');
    });

    it('should not show sorting options on structured view', () => {
        const contentType = contentTypes.editorialpicker;
        jcontent
            .createContent(contentType.typeName)
            .getPickerField(contentType.fieldNodeType, contentType.multiple)
            .open();

        cy.get('div[data-sel-type="editorial"] div[data-sel-role="sel-view-mode-dropdown"] > div[role="dropdown"] > span')
            .should('have.text', 'Structured')
            .should('not.have.text', 'List');

        cy.get('div[data-sel-type="editorial"] th[role="columnheader"] svg.moonstone-SortIndicator').should('not.exist');
    });
});
