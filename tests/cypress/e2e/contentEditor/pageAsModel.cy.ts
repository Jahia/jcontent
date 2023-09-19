import {ContentEditor, JContent} from '../../page-object';
import {Field} from '../../page-object/fields';
import {getComponentBySelector, Menu} from '@jahia/cypress';

describe('Page as model', () => {
    const siteKey = 'digitall';
    const model = 'Testmodel';

    beforeEach(() => {
        cy.login(); // Edit in chief
    });

    afterEach(() => {
        cy.logout();
    });

    it('Creates and uses page as model successfully', () => {
        // Create model page
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('New Page');
        let contentEditor = ContentEditor.getContentEditor();
        contentEditor.getSmallTextField('jnt:page_jcr:title').addNewValue('modeled-page');
        let templateField = contentEditor.getField(Field, 'jmix:hasTemplateNode_j:templateName');
        templateField.get().click();
        getComponentBySelector(Menu, '[role="listbox"]').select('simple');
        contentEditor.openSection('Options');
        contentEditor.toggleOption('jmix:canBeUseAsTemplateModel', 'Page Model name');
        cy.get('input[name="jmix:canBeUseAsTemplateModel_j:pageTemplateTitle"]').type(model);
        contentEditor.create();

        // Use page as model
        jcontent.getAccordionItem('pages').getTreeItem('home').contextMenu().select('New Page');
        contentEditor = ContentEditor.getContentEditor();
        contentEditor.getSmallTextField('jnt:page_jcr:title').addNewValue('use-model');
        templateField = contentEditor.getField(Field, 'jmix:hasTemplateNode_j:templateName');
        templateField.get().click();
        getComponentBySelector(Menu, '[role="listbox"]').select(model);
        contentEditor.create();

        const pageBuilder = jcontent.switchToPageBuilder();
        pageBuilder.getModule('/sites/digitall/home/use-model/landing').should('exist');
    });
});
