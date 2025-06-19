import {JContent} from '../../page-object/jcontent';
import {ContentEditor} from '../../page-object';

describe('Picker tests - Search', () => {
    let contentEditor: ContentEditor;
    let jcontent: JContent;

    beforeEach(() => {
        // I have issues adding these to before()/after() so have to add to beforeEach()/afterEach()
        cy.login(); // Edit in chief
        cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
        contentEditor = ContentEditor.visit('/sites/digitall/home/area-main/highlights/leading-by-example', 'digitall', 'en', 'pages/home');
        jcontent = new JContent();
    });

    afterEach(() => {
        cy.logout();
    });

    // Tests
    it('Media Picker - Search for tab - letter by letter', () => {
        const picker = contentEditor.getPickerField('jdmix:imgView_image').open();
        picker.getViewMode().select('List');
        picker.search('t');
        picker.verifyResultsLength(43);
        picker.search('a');
        picker.verifyResultsLength(43);
        picker.search('b');
        picker.verifyResultsLength(1);
        picker.getTableRow('person-smartphone-office-table.jpg').should('be.visible');
    });

    it('Media Picker - Search for tab - in different context', () => {
        const picker = contentEditor.getPickerField('jdmix:imgView_image').open();
        picker.getViewMode().select('List');
        picker.search('tab');
        picker.verifyResultsLength(1);
        picker.getTableRow('person-smartphone-office-table.jpg').should('be.visible');
        picker.switchSearchContext('Media');
        picker.verifyResultsLength(3);
        picker.getTableRow('portrait-taber.jpg').should('be.visible');
        picker.getTableRow('portrait-taber.png').should('be.visible');
    });

    it('Media Picker - Search for tab - cancel and reopen - search should be empty', () => {
        let picker = contentEditor.getPickerField('jdmix:imgView_image').open();
        picker.getViewMode().select('List');
        picker.search('tab');
        picker.verifyResultsLength(1);
        picker.getTableRow('person-smartphone-office-table.jpg').should('be.visible');
        picker.cancel();
        contentEditor.cancel();
        jcontent.switchToListMode();
        cy.get('table[data-cm-role="table-content-list"]').parent().scrollTo(0, 500);
        picker = jcontent.editComponentByText('Leading by Example').getPickerField('jdmix:imgView_image').open();
        picker.getSearchInput().should('be.empty');
    });

    it('Editorial Picker- Search for tab - letter by letter', () => {
        const picker = contentEditor.getPickerField('jdmix:hasLink_internalLink').open();
        picker.switchSearchContext('Digitall');
        picker.search('t');
        picker.verifyResultsAtLeast(82);
        picker.search('a');
        picker.verifyResultsAtLeast(82);
        picker.search('b');
        picker.verifyResultsLength(7);
    });

    it('Editorial Picker- Search for tab and them empty search - ensure previous context is restored', () => {
        const picker = contentEditor.getPickerField('jdmix:hasLink_internalLink').open();
        picker.wait();

        picker.switchSearchContext('Digitall');
        picker.getTab('content').click().then(tabItem => {
            picker.wait();
            cy.wrap(tabItem).should('have.class', 'moonstone-tabItem_selected');
        });
        picker.search('tab');
        picker.verifyResultsLength(7);
        picker.search();

        // Selection is not able to expand yet in structured view
        // Verify tabs are visible and previous tab is selected
        cy.log('empty search restores context');
        picker.getTab('content').should('have.class', 'moonstone-tabItem_selected');
    });

    it('Media Picker- Search for xylophone and should find nothing no matter the context', () => {
        const picker = contentEditor.getPickerField('jdmix:imgView_image').open();
        picker.getViewMode().select('List');
        picker.search('xylophone', true);
        picker.verifyResultsAreEmpty();
        picker.switchSearchContext('Media');
        picker.verifyResultsAreEmpty();
        picker.switchSearchContext('Digitall');
        picker.verifyResultsAreEmpty();
    });
});
