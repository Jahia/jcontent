import {JContent} from '../../page-object/jcontent';
import {enableModule} from '@jahia/cypress';

describe('Bound component tests', () => {
    const siteKey = 'boundComponentSite';
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        cy.logout();
    });

    it('Bound component can be added via content editor', () => {
        jcontent.switchToListMode();
        const contentEditor = jcontent.createContent('cent:boundComponent');
        const picker = contentEditor.getPickerField('jmix:bindedComponent_j:bindedComponent').open();
        picker.getAccordionItem('picker-pages').getTreeItem('home').click();
        picker.getTable().getRowByName('search-results').should('be.visible').click();
        picker.select();
        contentEditor.create();

        const boundComponent = jcontent.getTable().getRowByLabel('boundcomponent');
        boundComponent.contextMenu().select('edit');

        const pickerField = contentEditor.getPickerField('jmix:bindedComponent_j:bindedComponent');
        pickerField.assertValue('Search Results');
    });
});
