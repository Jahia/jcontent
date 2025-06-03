import {contentTypes} from '../../fixtures/contentEditor/pickers/contentTypes';
import {assertUtils} from '../../utils/assertUtils';
import {AccordionItem} from '../../page-object/accordionItem';
import {JContent} from '../../page-object/jcontent';

describe('Picker tests - multiple', () => {
    const siteKey = 'digitall';
    let jcontent: JContent;

    // Helper

    // setup

    beforeEach(() => {
        cy.login();
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        cy.logout();
    });

    it('should allow multi-select', () => {
        const contentType = contentTypes.fileMultipleReference;

        const pickerField = jcontent
            .createContent(contentType.typeName)
            .getPickerField(contentType.fieldNodeType, contentType.multiple);
        const picker = pickerField.open();
        const pagesAccordion: AccordionItem = picker.getAccordionItem('picker-media');
        assertUtils.isVisible(pagesAccordion.getHeader());

        cy.log('navigate to files > images > companies');
        pagesAccordion.expandTreeItem('images');
        pagesAccordion.getTreeItem('companies').click();
        picker.switchViewMode('List');
        const numRows = 3;
        cy.log(`select the first ${numRows} elements`);
        expect(numRows).gte(1); // Need at least one for testing removal
        picker.getTable().selectItems(numRows);
        cy.get('[data-cm-role="selection-table-collapse-button"] span')
            .should('be.visible').and('contain', `${numRows} items selected`);
        picker.select();

        cy.log('verify selected is listed in CE modal/page');
        const mimeType = 'image/png';
        pickerField
            .get()
            .find('[data-sel-content-editor-multiple-generic-field]')
            .then(elems => {
                expect(elems.length).eq(numRows);
                cy.wrap(elems).find('[data-sel-referenceCard-type]').should('contain', mimeType);

                cy.log('verify removed element is reflected in selection');
                cy.wrap(elems.eq(0))
                    .find('button[data-sel-action^="removeField"]')
                    .click();
            });
        pickerField.open();
        picker.getTable().getSelectedRows().then(rows => expect(rows.length).eq(numRows - 1));
    });

    it('should display selection table', () => {
        const pickerField = jcontent
            .createContent(contentTypes.fileMultipleReference.typeName)
            .getPickerField(
                contentTypes.fileMultipleReference.fieldNodeType,
                contentTypes.fileMultipleReference.multiple
            );
        const picker = pickerField.open();

        const mediaAccordion: AccordionItem = picker.getAccordionItem('picker-media');
        assertUtils.isVisible(mediaAccordion.getHeader());
        picker.wait();
        picker.switchViewMode('List');
        cy.log('verify no selection caption is displayed');
        picker
            .getSelectionCaption()
            .should('be.visible')
            .invoke('attr', 'data-sel-role')
            .should('eq', 'no-item-selected');

        cy.log('navigate to different folders and select one item');
        const numSelected = 3;
        picker.navigateTo(mediaAccordion, 'files/images/banners');
        picker.getTable().selectItems(1);
        picker.navigateTo(mediaAccordion, 'files/images/companies');
        picker.getTable().selectItems(1);
        picker.navigateTo(mediaAccordion, 'files/images/devices');
        picker.getTable().selectItems(1);

        cy.log('toggle open selection table');
        picker.getSelectionCaption()
            .invoke('attr', 'data-sel-role')
            .should('eq', `${numSelected}-item-selected`);
        picker.getSelectionCaption().should('be.visible').click();
        picker.getSelectionTable().get().should('be.visible');
        picker
            .getSelectionTable()
            .getRows()
            .get()
            .then(rows => expect(rows.length).eq(numSelected));
        picker
            .getSelectionTable()
            .get()
            .find('span').contains('digitall/files/images/devices');

        cy.log('remove selection through selection table');
        picker
            .getSelectionTable()
            .get()
            .find('tr[data-sel-path*="files/images/devices"]')
            .find('[data-cm-role="actions-cell"] button')
            .click({force: true});
        picker.navigateTo(mediaAccordion, 'files/images/devices');
        picker.getTable().getSelectedRows().should('not.exist');

        cy.log('toggle close selection table');
        cy.get('[data-cm-role="selection-table-container"] [data-cm-role="selection-table-collapse-button"]').click();
        picker.getSelectionTable().get().should('not.be.visible');
    });

    it('should select/unselect all', () => {
        const pickerField = jcontent
            .createContent(contentTypes.fileMultipleReference.typeName)
            .getPickerField(
                contentTypes.fileMultipleReference.fieldNodeType,
                contentTypes.fileMultipleReference.multiple
            );
        const picker = pickerField.open();

        const mediaAccordion: AccordionItem = picker.getAccordionItem('picker-media');
        assertUtils.isVisible(mediaAccordion.getHeader());
        picker.switchViewMode('List');
        const path = 'files/images/backgrounds';
        cy.log(`navigate to ${path}`);
        picker.navigateTo(mediaAccordion, path);

        picker
            .getTable()
            .getRows()
            .get()
            .then(elems => {
                const rowCount = elems.length;
                cy.log(`row count: ${rowCount}`);

                cy.log('test "select all"');
                picker.getTable().getHeaderById('selection').click();
                picker.getTable().getSelectedRows().then(rows => expect(rows.length).eq(rowCount));

                cy.log('test "unselect all"');
                picker.getTable().getHeaderById('selection').click();
                picker.getTable().getSelectedRows().should('not.exist');
            });
    });
});
