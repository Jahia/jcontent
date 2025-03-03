import {JContent} from '../../page-object/jcontent';
import {enableModule} from '@jahia/cypress';
import {PickerField} from '../../page-object/fields';

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
        picker.getTableRow('Search Results').click();
        picker.select();
        contentEditor.create();

        const boundComponent = jcontent.getTable().getRowByLabel('boundcomponent');
        boundComponent.contextMenu().select('edit');

        const pickerField = contentEditor.getPickerField('jmix:bindedComponent_j:bindedComponent');
        pickerField.assertValue('Search Results');
        pickerField.open();
    });
});
